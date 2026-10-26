import sys
sys.path.insert(0, r'c:\Users\SanyuPaul\Desktop\Final_Year_Project\Project\backend')

from report_generator import generate_pdf_report

test_data = {
    'risk_level': 'Likely Genuine',
    'probability': 12.5,
    'ai_insight': 'This account shows strong authentic signals.',
    'username': 'testuser',
    'fullname': 'Test User',
    'profile pic': 1,
    'nums/length username': 0.1,
    'fullname words': 2,
    'nums/length fullname': 0.0,
    'name==username': 0,
    'description length': 150,
    'external URL': 1,
    'private': 0,
    '#posts': 120,
    '#followers': 500,
    '#follows': 300
}

try:
    buf = generate_pdf_report(test_data)
    content = buf.read()
    print(f"SUCCESS — PDF size: {len(content)} bytes")
    print(f"Starts with PDF header: {content[:4] == b'%PDF'}")
    with open(r'c:\Users\SanyuPaul\Desktop\Final_Year_Project\Project\backend\test_out.pdf', 'wb') as f:
        f.write(content)
    print("Saved to test_out.pdf")
except Exception as e:
    import traceback
    print("ERROR:")
    traceback.print_exc()
