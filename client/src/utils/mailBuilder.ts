import { workflowApi } from "../api/workflowApi";

export const escapeHtml = (value: any) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const buildMailBody = ({
  title,
  ticketNo,
  requester,
  approver,
  stage,
  action,
  items,
  comments,
}: {
  title: string;
  ticketNo: string;
  requester: string;
  approver: string;
  stage: string;
  action: string;
  items: any[];
  comments?: string;
}) => {
  const rows = items
    .map(
      (item: any, index: number) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(item.folderPath)}</td>
        <td>${escapeHtml(item.accessType)}</td>
        <td>${escapeHtml(item.confirmAccessType || "-")}</td>
        <td>${escapeHtml(item.reasonForAccess)}</td>
        <td>${escapeHtml(item.status || stage)}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2937;">
      <h2 style="color:#2563eb;">${escapeHtml(title)}</h2>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;margin-bottom:16px;">
        <tr><td><b>Ticket No</b></td><td>${escapeHtml(ticketNo)}</td></tr>
        <tr><td><b>Requester</b></td><td>${escapeHtml(requester)}</td></tr>
        <tr><td><b>Approver / Actor</b></td><td>${escapeHtml(approver)}</td></tr>
        <tr><td><b>Stage</b></td><td>${escapeHtml(stage)}</td></tr>
        <tr><td><b>Action</b></td><td>${escapeHtml(action)}</td></tr>
        ${comments ? `<tr><td><b>Comments</b></td><td style="color:#2563eb;font-weight:500;">${escapeHtml(comments)}</td></tr>` : ""}
        <tr><td><b>Date</b></td><td>${new Date().toLocaleString()}</td></tr>
      </table>
      <h3>Access Request Details</h3>
      <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;width:100%;">
        <thead style="background:#f1f5f9;">
          <tr>
            <th>#</th><th>Folder Path</th><th>Requested Access</th>
            <th>Confirmed Access</th><th>Reason</th><th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

export const sendMailLog = async ({
  mailProgram,
  mailFrom = "feedback@janatics.co.in",
  mailTo,
  mailSubject,
  mailBody,
  mailCc = "",
}: {
  mailProgram: string;
  mailFrom?: string;
  mailTo: string;
  mailSubject: string;
  mailBody: string;
  mailCc?: string;
}) => {
  await workflowApi.insertMailLog({
    mailDate: new Date().toISOString(),
    mailProgram,
    mailFrom: mailFrom || "feedback@janatics.co.in",
    mailTo,
    mailSubject,
    mailSent: false,
    mailBody,
    mailCc,
  });
};
