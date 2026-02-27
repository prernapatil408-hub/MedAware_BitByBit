from collections import Counter
from datetime import date

import cv2
import easyocr
from flask import Flask, request, jsonify, session
from flask_session import Session
from flask_socketio import SocketIO, disconnect, emit
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import numpy as np
import socketio
from ultralytics import YOLO
from models import db, User, Reminder, Medicine_Reminder, Reminder_Log
import os

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql://root:123@localhost:3306/medaware"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "BitByBit2007"
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False  # Development only
app.config["SESSION_COOKIE_HTTPONLY"] = True


# --- Flask-Session Configuration ---
app.config["SESSION_TYPE"] = "sqlalchemy"  # Use the database for storage
app.config["SESSION_SQLALCHEMY"] = db  # Point to your existing SQLAlchemy instance
app.config["SESSION_SQLALCHEMY_TABLE"] = "sessions"  # Name of the table to be created
app.config["SESSION_PERMANENT"] = True  # Allow sessions to last across browser restarts
app.config["SESSION_USE_SIGNER"] = True  # Sign the session cookie for extra security
app.config["SECRET_KEY"] = "BitByBit2007"


# Initialize SocketIO correctly
socketio = SocketIO(
    app, cors_allowed_origins="*", cors_credentials=True, async_mode="eventlet"
)

CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

db.init_app(app)

server_session = Session(app)

with app.app_context():
    db.create_all()

reader = easyocr.Reader(["en"], gpu=True)
model = YOLO("custom.pt")
user_states = {}


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({"error": "A user with this email already exists"}), 400

    new_user = User(
        email=email,
        password=password,
        age=data.get("age"),
        gender=data.get("gender"),
        height=data.get("height"),
        weight=data.get("weight"),
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"success": "User created successfully"}), 200


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "User does not exist"}), 400

    if user.password == password:
        session["uid"] = user.uid

        # It's good practice to tell Flask the session was changed
        session.modified = True

        return jsonify({"success": "Logged in successfully", "uid": user.uid}), 200
    return jsonify({"error": "User email or password is incorrect"}), 401


@app.route("/add_reminder", methods=["POST"])
def add_reminder():
    # uid = session["uid"]
    data = request.get_json()
    uid = data.get("uid")
    user = User.query.filter_by(uid=uid).first()
    if not user:
        return jsonify({"error": "User not logged in"}), 400
    new_reminder = Reminder(uid=uid, rtime=data.get("rtime"))
    db.session.add(new_reminder)
    db.session.commit()
    return jsonify(
        {"success": "Reminder added successfully", "rid": new_reminder.rid}
    ), 200


@app.route("/add_medicine", methods=["POST"])
def add_medicine():
    data = request.get_json()
    uid = data.get("uid")
    user = User.query.filter_by(uid=uid).first()
    if not user:
        return jsonify({"error": "User not logged in"}), 400
    data = request.get_json()
    reminder = Reminder.query.filter_by(rid=data.get("rid")).first()
    if not reminder:
        return jsonify({"error": "Reminder does not exist"}), 400
    new_medicine = Medicine_Reminder(
        mname=data.get("mname"),
        rid=reminder.rid,
        dose_qty=data.get("dose_qty"),
        total_qty=data.get("total_qty"),
    )
    db.session.add(new_medicine)
    db.session.commit()
    return jsonify(
        {"success": "Medicine added successfully", "mid": new_medicine.mid}
    ), 200


@app.route("/get_reminders", methods=["POST"])
def get_reminders():
    data = request.get_json()
    uid = data.get("uid")
    user = User.query.filter_by(uid=uid).first()
    if not user:
        return jsonify({"error": "User not logged in"}), 400
    remindersDictList = []
    for r in Reminder.query.filter_by(uid=session.get("uid")).all():
        remindersDictList.append(r.to_dict())
    return jsonify(remindersDictList), 200


@app.route("/get_medicines", methods=["POST"])
def get_medicines():
    data = request.get_json()
    uid = data.get("uid")
    user = User.query.filter_by(uid=uid).first()
    if not user:
        return jsonify({"error": "User not logged in"}), 400
    data = request.get_json()
    medicinesDictList = []
    for m in Medicine_Reminder.query.filter_by(rid=data.get("rid")).all():
        medicinesDictList.append(m.to_dict())
    return jsonify(medicinesDictList), 200


@socketio.on("connect")
def connect():
    emit("success", {"message": "connected successfully"})
    return


@socketio.on("raw_frame")
def raw_frame(data):
    """
    'data' is now expected to be a dict: {'uid': 456, 'rid': 123, 'frame': b'...'} this should contain rid and raw binary for frame
    """
    uid = data.get("uid")
    user = User.query.filter_by(uid=uid).first()
    if not user:
        emit("error", {"message": "User not logged in"})
        disconnect()
        return

    rid = data.get("rid")
    frame_bytes = data.get("frame")

    if not rid:
        emit("error", {"message": "Missing rid"})
        return
    if not frame_bytes:
        emit("error", {"message": "Missing frame_bytes"})
        return

    if uid not in user_states:
        user_states[uid] = {
            "counter": 0,  # Counter stands for frame counter
            "buffer": [],
            "display_name": "Scanning...",
            "is_logged": False,  # Add this flag!
        }

    nparr = np.frombuffer(frame_bytes, np.uint8)
    # 2. Decode the JPEG bytes into an OpenCV image (BGR)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if not frame:
        emit("error", {"message": "frame is empty"})
        return

    state = user_states[uid]
    state["counter"] += 1

    face_found = False
    medicine_found = False

    # Actual prediction logic
    results = model.predict(source=frame, conf=0.5, verbose=False)
    annotated_frame = frame.copy()  # Start with a clean frame
    height, width, channels = frame.shape
    print(f"Current Resolution: {width}x{height}")

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # --- TARGET MEDICINE (ID 0) ---
            if class_id == 0:
                medicine_found = True
                # Draw a Green box for medicine
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

                if state["counter"] % 10 == 0:  # ONLY RUN OCR EVERY 10 FRAMES
                    crop = frame[y1:y2, x1:x2]
                    if crop.size > 0:
                        ocr_res = reader.readtext(crop)
                        for bbox, text, prob in ocr_res:
                            if prob > 0.4 and len(text) > 3:
                                state["buffer"].append(text.upper())

                        if len(state["buffer"]) > 10:
                            state["buffer"].pop(0)
                        if state["buffer"]:
                            state["display_name"] = Counter(
                                state["buffer"]
                            ).most_common(1)[0][0]

                # Draw the label above the bottle
                cv2.putText(
                    annotated_frame,
                    f"MEDICINE: {state['display_name']}",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 255, 0),
                    2,
                )

                # --- TARGET FACE (ID 1) ---
            elif class_id == 1:
                face_found = True
                # Draw a Blue box for face, but NO OCR code here
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.putText(
                    annotated_frame,
                    "FACE",
                    (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 0, 0),
                    1,
                )
     # 1. Define your desired display width
    display_width = 1280 
    
    # 2. Calculate the ratio and new height
    h, w = annotated_frame.shape[:2]
    ratio = display_width / float(w)
    display_height = int(h * ratio)

    # 3. Resize for display
    resized_frame = cv2.resize(annotated_frame, (display_width, display_height))

    # 4. Show the resized version
    cv2.imshow("Corrected ID Window", resized_frame)

    if (
        medicine_found == True
        and face_found == True
        and state["display_name"] != "Scanning..."
    ):
        if not state["is_logged"]:
            new_reminder_log = Reminder_Log(
                status="Verified", rid=rid, uid=uid, date=date.today()
            )
            db.session.add(new_reminder_log)
            db.session.commit()

            state["is_logged"] = True  # Set the lock
            emit("verified", {"message": "Medicine verified successfully"})
    success, buffer = cv2.imencode(".jpg", annotated_frame)
    if success:
        emit("annotated_frame", buffer.tobytes())
    else:
        emit("error", "Conversion of annotated frame to jpg failed")


@socketio.on("missed")
def missed(data):
    """
    data contains json {"uid": 456, "rid": 123}
    """
    uid = data.get("uid")
    user = User.query.filter_by(uid=uid).first()
    if not user:
        emit("error", {"message": "User not logged in"})
        disconnect()
        return
    rid = data.get("rid")
    new_reminder_log = Reminder_Log(
        status="Missed", rid=rid, uid=uid, date=date.today()
    )
    db.session.add(new_reminder_log)
    db.session.commit()


@socketio.on("not verified")
def not_verified(data):
    """
    data contains json {"uid": 456, "rid": 123}
    """
    uid = data.get("uid")
    user = User.query.filter_by(uid=uid).first()
    if not user:
        emit("error", {"message": "User not logged in"})
        disconnect()
        return
    rid = data.get("rid")
    new_reminder_log = Reminder_Log(
        status="Not Verified", rid=rid, uid=uid, date=date.today()
    )
    db.session.add(new_reminder_log)
    db.session.commit()


@socketio.on("disconnect")
def handle_disconnect():
    print("User disconnected. Memory cleared.")


if __name__ == "__main__":
    socketio.run(app, host="192.168.0.114", port=8080, debug=True)

