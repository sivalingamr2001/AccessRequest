Goal
Navigate on page http://localhost:5173/FSFA_portal:

Step 1: Logout from Sivalingam
- In the top right, hover or click on the user profile "Sivalingam" (around X=950, Y=30) to reveal the dropdown menu.
- Click "Logout" in the dropdown menu.

Step 2: Login as Kothannda Raaman
- Username: `Kothannda Raaman`
- Password: `Bell@1357`
- Click Sign In.

Step 3: Test HOD Approval for EDP (Single Approval Auto-Advance)
- Click on "HOD Approvals" tab in the navigation bar.
- Locate the pending item for ticket (REQ-00000003 or latest EDP ticket).
- Click "Approve" button on that item.
- A modal opens for HOD Decision. Confirm Access Type is "ReadOnly", enter comments "Approved EDP by HOD", and click "Submit Decision".
- Verify success message.
- Verify that the item moves directly to `PENDING_OPERATOR` and does NOT stay in `PENDING_FOLDER_OWNER` or show up in Kothannda Raaman's queue again.

Step 4: Logout and Login as BOOPATHY (Operator)
- Hover/click user profile -> Logout.
- Login with Username: `BOOPATHY`, Password: `Myna@123`.
- Click on "Operator Console" or "Fulfillment" tab.
- Locate the EDP ticket in the Operator Cart (status PENDING_OPERATOR).
- Click "Grant Access" / "Approve", enter comments "Granted by Operator", submit.
- Verify status is updated to `ACCESS_GRANTED`.
- Click "Revoke" button on that item, enter comments "Revoking for test", submit.
- Verify status becomes `ACCESS_REVOKED`.

Step 5: Logout and Login as Sivalingam to Test Resubmit
- Logout from BOOPATHY.
- Login with Username: `Sivalingam`, Password: `1&Uca611`.
- In "My Access Requests", click "Details & Logs" on the ticket.
- Verify "Edit Request" is NOT shown, but "Resubmit Request" IS shown.
- Click "Resubmit Request", update comments/reason to "Resubmitting revoked EDP", agree to terms and submit.
- Verify the ticket resets to `PENDING_DEPT_HOD`.

Step 6: Capture final screenshot and return test report.
I will view the scratchpad file to retrieve any existing context and plan the task.

Step 7: Create a request as folder path \\10.30.50.15\jipl\5S folder and submit 

Step 8: Find this request and approve Login as Kothannda Raaman
- Username: `Kothannda Raaman`
- Password: `Bell@1357`

Step 9: and now approve as Folder Owner Login as Kothannda Raaman
- Username: `P6IOKIK`
- Password: `Janatics@1977`

Step 10: Logout and Login as BOOPATHY (Operator)
- Hover/click user profile -> Logout.
- Login with Username: `BOOPATHY`, Password: `Myna@123`.
- Click on "Operator Console" or "Fulfillment" tab.
- Locate the EDP ticket in the Operator Cart (status PENDING_OPERATOR).
- Click "Grant Access" / "Approve", enter comments "Granted by Operator", submit.
- Verify status is updated to `ACCESS_GRANTED`.
- Click "Revoke" button on that item, enter comments "Revoking for test", submit.
- Verify status becomes `ACCESS_REVOKED`.

Step 11: Logout and Login as Sivalingam to Test Resubmit
- Logout from BOOPATHY.
- Login with Username: `Sivalingam`, Password: `1&Uca611`.
- In "My Access Requests", click "Details & Logs" on the ticket.
- Verify "Edit Request" is NOT shown, but "Resubmit Request" IS shown.
- Click "Resubmit Request", update comments/reason to "Resubmitting revoked EDP", agree to terms and submit.
- Verify the ticket resets to `PENDING_DEPT_HOD`.

Step 12: Capture final screenshot and return test report.
I will view the scratchpad file to retrieve any existing context and plan the task.
