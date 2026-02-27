import cv2
import easyocr
from ultralytics import YOLO
from collections import Counter

# Setup
reader = easyocr.Reader(['en'], gpu=True) 
model = YOLO("custom.pt")
cap = cv2.VideoCapture(0)

text_buffer = [] 
display_name = ""

while True:
    ret, frame = cap.read()
    if not ret: break

    results = model.predict(source=frame, conf=0.5, verbose=False)
    annotated_frame = frame.copy() # Start with a clean frame

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # --- TARGET MEDICINE (ID 0) ---
            if class_id == 0: 
                # Draw a Green box for medicine
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                crop = frame[y1:y2, x1:x2]
                if crop.size > 0:
                    ocr_res = reader.readtext(crop)
                    for (bbox, text, prob) in ocr_res:
                        if prob > 0.4 and len(text) > 3:
                            text_buffer.append(text.upper())

                    if len(text_buffer) > 10: text_buffer.pop(0)
                    if text_buffer:
                        display_name = Counter(text_buffer).most_common(1)[0][0]

                # Draw the label above the bottle
                cv2.putText(annotated_frame, f"MEDICINE: {display_name}", (x1, y1 - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # --- TARGET FACE (ID 1) ---
            elif class_id == 1:
                # Draw a Blue box for face, but NO OCR code here
                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.putText(annotated_frame, "FACE", (x1, y1 - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)

    cv2.imshow("Corrected ID Window", annotated_frame)
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()
cv2.destroyAllWindows()
