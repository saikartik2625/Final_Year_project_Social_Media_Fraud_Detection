import requests

def test_verify(username):
    url = f"https://www.instagram.com/{username}/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    try:
        response = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
        print(f"User: {username}")
        print(f"Status: {response.status_code}")
        print(f"Final URL: {response.url}")
        
        if response.status_code != 200:
            print(f"Result: NOT FOUND (Status {response.status_code})")
            return

        final_url = response.url.lower()
        if "accounts/login" in final_url or "unavailable" in final_url:
            print("Result: NOT FOUND (Redirected)")
            return

        sample = response.text.lower()
        # Look for indicators that this is a profile page
        is_profile = (
            '"profile_id"' in sample or 
            '{"username":"' + username.lower() + '"' in sample or
            '"owner":{"id"' in sample or
            f'instagram.com/{username.lower()}/' in response.text.lower()
        )

        if is_profile:
            print("Result: FOUND (Profile indicators present)")
        else:
            print("Result: NOT FOUND (No profile indicators found)")
    except Exception as e:
        print(f"Error: {e}")

print("--- Testing sanyu123ere ---")
test_verify("sanyu123ere")
print("\n--- Testing google ---")
test_verify("google")
