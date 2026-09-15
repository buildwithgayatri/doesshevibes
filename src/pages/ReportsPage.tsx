import { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Check,
  X,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { reportTypeLabels } from '@/data/sampleData';
import ReportProblemModal from '@/components/ReportProblemModal';
import type { CommunityReport, ReportType } from '@/types';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
    ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function statusBadge(status: string) {
  if (status === 'active') return 'bg-rose-100 text-rose-600';
  if (status === 'resolved') return 'bg-green-100 text-green-600';
  return 'bg-gray-100 text-gray-500';
}

export default function ReportsPage() {
  const {
    reports,
    currentUserId,
    updateReport,
    deleteReport,
  } = useApp();

  const [showReportModal, setShowReportModal] = useState(false);
  const [editingReport, setEditingReport] = useState<CommunityReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<CommunityReport | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const myReports = reports.filter((r) => r.reported_by === currentUserId);

  const handleDelete = () => {
    if (deletingReport) {
      deleteReport(deletingReport.id);
      setDeletingReport(null);
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);
    }
  };

  const handleReportSubmitted = () => {
    setShowReportModal(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">My Reports</h1>
        <p className="text-sm text-gray-500">
          View, edit, and delete reports you've submitted to the community.
        </p>
      </div>

      {/* Submit new report button */}
      <button
        onClick={() => setShowReportModal(true)}
        className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" /> Submit a New Report
      </button>

      {/* My Reports list */}
      <div className="bg-white rounded-2xl border border-rose-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-rose-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Your Submitted Reports
            <span className="text-sm font-normal text-gray-400">({myReports.length})</span>
          </h2>
        </div>

        {myReports.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400 mb-1">You haven't submitted any reports yet.</p>
            <p className="text-xs text-gray-300">
              Tap "Submit a New Report" above to report a safety issue in your area.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-rose-50">
            {myReports.map((report) => {
              const meta = reportTypeLabels[report.type] || reportTypeLabels.other;
              return (
                <div key={report.id} className="p-4 hover:bg-rose-50/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${meta.color}15` }}
                    >
                      <AlertTriangle className="w-5 h-5" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{meta.label}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${statusBadge(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {report.location_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDate(report.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {report.confirmations} confirmations
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 ml-12">
                    <button
                      onClick={() => setEditingReport(report)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeletingReport(report)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Report submission modal */}
      {showReportModal && (
        <ReportProblemModal onClose={handleReportSubmitted} />
      )}

      {/* Edit modal */}
      {editingReport && (
        <EditReportModal
          report={editingReport}
          onSave={(updates) => {
            updateReport(editingReport.id, updates);
            setEditingReport(null);
          }}
          onCancel={() => setEditingReport(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingReport && (
        <div
          className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
          onClick={() => setDeletingReport(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800">Delete this report?</h3>
            </div>
            <p className="text-sm text-gray-500">
              This report will be removed from your submitted reports and will no longer be used as a community signal.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingReport(null)}
                className="flex-1 bg-gray-100 text-gray-600 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit success toast */}
      {submitSuccess && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[4000] animate-fade-in">
          <div className="bg-green-500 text-white rounded-xl px-5 py-3 shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Report submitted successfully.</span>
          </div>
        </div>
      )}

      {/* Delete success toast */}
      {deleteSuccess && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[4000] animate-fade-in">
          <div className="bg-green-500 text-white rounded-xl px-5 py-3 shadow-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Report deleted successfully.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function EditReportModal({
  report,
  onSave,
  onCancel,
}: {
  report: CommunityReport;
  onSave: (updates: Partial<CommunityReport>) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<ReportType>(report.type);
  const [description, setDescription] = useState(report.description);
  const [locationName, setLocationName] = useState(report.location_name);

  const reportTypes = Object.keys(reportTypeLabels) as ReportType[];

  const handleSave = () => {
    if (!description.trim()) return;
    onSave({ type, description: description.trim(), location_name: locationName.trim() });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-rose-100 p-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-rose-400" /> Edit Report
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Report Type</p>
            <div className="grid grid-cols-2 gap-2">
              {reportTypes.map((t) => {
                const meta = reportTypeLabels[t];
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-all ${
                      type === t
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-gray-100 text-gray-500 hover:border-rose-200'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: meta.color }}
                    />
                    <span className="truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Location / Area</p>
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Location name"
              className="w-full px-3 py-2.5 rounded-xl border border-rose-100 text-sm outline-none focus:border-rose-300"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem..."
              className="w-full px-3 py-2.5 rounded-xl border border-rose-100 text-sm outline-none focus:border-rose-300 resize-none"
              rows={3}
            />
          </div>

          <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-xs text-amber-600">
              The report will be marked as updated and immediately reflect the corrected information.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!description.trim()}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
