import { FileText } from 'lucide-react';

interface DocumentLog {
  id: string;
  date: string;
  status: 'Accepted' | 'Pending' | 'Rejected';
  fileName: string;
  remarks: string;
}

const documentLogs: DocumentLog[] = [
  {
    id: '1',
    date: 'Oct 24, 2023 10:30 AM',
    status: 'Pending',
    fileName: 'Q3_Financial_Report.pdf',
    remarks: 'Awaiting department head signature'
  },
  {
    id: '2',
    date: 'Oct 23, 2023 04:15 PM',
    status: 'Accepted',
    fileName: 'Student_Enrollment_List_2023.xlsx',
    remarks: 'Approved by Registrar'
  },
  {
    id: '3',
    date: 'Oct 22, 2023 09:00 AM',
    status: 'Pending',
    fileName: 'Teacher_Syllabus_Math101.docx',
    remarks: 'Under review by Curriculum Dept'
  },
  {
    id: '4',
    date: 'Oct 21, 2023 02:45 PM',
    status: 'Accepted',
    fileName: 'Facility_Maintenance_Request.pdf',
    remarks: 'Scheduled for next week'
  },
  {
    id: '5',
    date: 'Oct 20, 2023 11:20 AM',
    status: 'Rejected',
    fileName: 'Field_Trip_Proposal.pdf',
    remarks: 'Missing budget breakdown'
  },
  {
    id: '6',
    date: 'Oct 19, 2023 03:50 PM',
    status: 'Accepted',
    fileName: 'Annual_Budget_Review.xlsx',
    remarks: 'Approved by Finance'
  }
];

export const LoginMonitoringTable = () => {
  return (
    <div className="faculty-panel overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-border/70 p-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Document Tracking</h2>
          <p className="mt-1 text-sm text-muted-foreground">Real-time document submission and approval tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-primary"></span>
          <span className="text-xs font-medium text-primary">Live Updates</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-accent/45">
              <th className="w-[20%] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="w-[20%] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="w-[30%] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">File Name</th>
              <th className="w-[30%] px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {documentLogs.map((doc) => (
              <tr key={doc.id} className="transition-colors hover:bg-accent/25">
                <td className="py-4 px-6">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{doc.date}</div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    doc.status === 'Accepted'
                      ? 'border-primary/20 bg-primary/5 text-primary'
                      : doc.status === 'Pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                      : 'border-destructive/20 bg-destructive/10 text-destructive'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      doc.status === 'Accepted' ? 'bg-primary' :
                      doc.status === 'Pending' ? 'bg-amber-500' :
                      'bg-destructive'
                    }`}></span>
                    {doc.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="max-w-[200px] cursor-pointer truncate text-sm font-medium text-primary hover:underline">{doc.fileName}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-sm text-muted-foreground">
                    {doc.remarks}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
