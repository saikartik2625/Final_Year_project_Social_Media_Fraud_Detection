import sys
sys.path.insert(0, r'c:\Users\SanyuPaul\Desktop\Final_Year_Project\Project\backend')
from report_generator import generate_pdf_report

test_data = {
    'risk_level': 'Likely Fraudulent',
    'probability': 87.4,
    'ai_insight': 'This account shows multiple high-confidence fraud signals including an unusually high following-to-follower ratio, no profile picture, empty bio, and numeric-heavy username patterns commonly associated with bot accounts.',
    'username': 'bot_user_99',
    'fullname': 'Bot User',
    'profile pic': 0,
    'nums/length username': 0.22,
    'fullname words': 2,
    'nums/length fullname': 0.0,
    'name==username': 0,
    'description length': 0,
    'external URL': 0,
    'private': 0,
    '#posts': 3,
    '#followers': 12,
    '#follows': 7800
}

buf = generate_pdf_report(test_data)
content = buf.read()
print(f"PDF size: {len(content)} bytes")
print(f"Valid PDF: {content[:4] == b'%PDF'}")

# Count pages via EOF markers
page_count = content.count(b'/Type /Page\n') + content.count(b'/Type/Page\n') + content.count(b'/Type /Page\r') + content.count(b'/Type/Page ')
print(f"Approx page markers found: {page_count}")

out = r'c:\Users\SanyuPaul\Desktop\Final_Year_Project\Project\backend\test_2page.pdf'
with open(out, 'wb') as f:
    f.write(content)
print(f"Saved to {out}")
