import urllib.request
import json

def test():
    base_url = "http://127.0.0.1:8000"
    
    # 1. Health
    req = urllib.request.Request(f"{base_url}/api/health/")
    with urllib.request.urlopen(req) as resp:
        print("Health check:", resp.status, resp.read().decode()[:80])

    # 2. Login
    payload = json.dumps({"email": "admin@root4tech.com", "password": "Root4Tech2025!"}).encode()
    req = urllib.request.Request(
        f"{base_url}/api/accounts/login/",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("Login status:", resp.status)
        print("Logged in user:", data["user"]["email"], "Role:", data["user"]["role"])
        token = data["tokens"]["access"]

    # 3. Profile
    req = urllib.request.Request(
        f"{base_url}/api/accounts/profile/",
        headers={"Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("Profile status:", resp.status, data["full_name"])

    # 4. Dashboard Stats
    req = urllib.request.Request(f"{base_url}/api/dashboard/stats/")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("Stats Total Leads:", data["totalLeads"]["value"], "Active Deals:", data["activeDeals"]["value"])

    # 5. Dashboard Charts
    req = urllib.request.Request(f"{base_url}/api/dashboard/charts/")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print("Sales Velocity points:", len(data["salesVelocity"]), "Lead Sources:", len(data["leadSources"]))

    print("\nALL BACKEND ENDPOINTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test()
