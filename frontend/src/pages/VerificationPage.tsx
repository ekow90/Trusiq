import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";

const documentTypes = [
  { label: "Business License", required: true },
  { label: "Registration Certificate", required: true },
  { label: "Government Issued ID", required: true },
];

export function VerificationPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [documents, setDocuments] = useState<
    { type: string; data: string; name: string }[]
  >([]);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function selectDocument(
    type: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setStatus(`${file.name} is larger than 20 MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setDocuments((current) => [
        ...current.filter((document) => document.type !== type),
        { type, data: String(reader.result), name: file.name },
      ]);
    reader.readAsDataURL(file);
  }

  async function submitVerification() {
    if (!documents.length) {
      setStatus("Select at least one government document first.");
      return;
    }
    setSubmitting(true);
    setStatus("");
    try {
      const response = await fetch("/api/companies/owner/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documents }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error || "Could not submit verification request");
      setStatus(
        body.message || "Verification request submitted and is pending review.",
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Could not submit verification request",
      );
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="min-h-screen bg-[#edf5fb] p-4 sm:p-8">
      <div className="mx-auto w-full max-w-[440px] overflow-hidden rounded-[28px] border border-[#dfeaf6] bg-[#f8fbff] text-[#12304a] shadow-[0_28px_65px_rgba(18,48,74,0.12)]">
        <div className="px-5 pt-4 pb-0">
          <div className="flex items-center justify-between text-[12px] font-semibold text-[#203246]">
            <span>9:41</span>
            <div className="flex items-center gap-2 text-[14px]">
              <i className="bi bi-signal" aria-hidden="true" />
              <i className="bi bi-wifi" aria-hidden="true" />
              <i className="bi bi-battery-full" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="grid size-7 place-items-center rounded-full bg-white text-lg text-[#12304a] shadow-sm"
              aria-label="Back"
            >
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </button>
            <h1 className="text-[26px] font-black tracking-[-0.04em]">
              Verification
            </h1>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-full bg-white text-lg text-[#12304a] shadow-sm"
              aria-label="Help"
            >
              <i className="bi bi-info-circle" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="rounded-[22px] bg-[#eaf2fb] p-4">
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-[16px] bg-[#dfeaff] text-[#2d6dba]">
                <i
                  className="bi bi-shield-check text-[24px]"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h2 className="text-[26px] font-black tracking-[-0.04em]">
                  Get Verified
                </h2>
                <p className="text-[14px] text-[#44607d]">
                  Boost your Trust Score by up to 40%
                </p>
              </div>
            </div>
            <p className="mt-4 text-[15px] leading-7 text-[#486279]">
              Verified businesses receive a blue checkmark, prioritized search
              ranking, and blockchain-backed credibility.
            </p>
            <div className="mt-4 flex gap-3">
              <span className="inline-flex rounded-full border border-[#ccdbef] bg-white px-3 py-1.5 text-xs font-black text-[#345f8e]">
                Identity Verified
              </span>
              <span className="inline-flex rounded-full border border-[#ccdbef] bg-white px-3 py-1.5 text-xs font-black text-[#345f8e]">
                License Validated
              </span>
            </div>
          </div>

          <div className="mt-7">
            <h3 className="text-[20px] font-black tracking-[-0.04em]">
              Business Documents
            </h3>
            {documentTypes.map((doc, index) => (
              <div
                key={doc.label}
                className="mt-4 rounded-[18px] border border-dashed border-[#d7e1ee] bg-white p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[16px] font-black text-[#12304a]">
                    {doc.label}
                    {doc.required ? (
                      <span className="ml-1 text-[#e4565b]">*</span>
                    ) : null}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7e8fa1]">
                    PDF, JPG, PNG
                  </span>
                </div>
                <div className="mt-4 grid place-items-center rounded-[16px] border border-dashed border-[#d6e0ec] bg-[#f7f9fb] p-6 text-center">
                  <div className="mb-3 grid size-12 place-items-center rounded-full bg-[#edf2f7] text-[26px] text-[#617c93]">
                    <i className="bi bi-cloud-upload" aria-hidden="true" />
                  </div>
                  <label className="cursor-pointer text-[16px] font-bold text-[#4d5f72]">
                    <input
                      type="file"
                      accept=".pdf,image/jpeg,image/png"
                      className="sr-only"
                      onChange={(event) => selectDocument(doc.label, event)}
                    />
                    {documents.find((document) => document.type === doc.label)
                      ?.name || "Tap to upload file"}
                  </label>
                  <div className="mt-1 text-[12px] text-[#6f8192]">
                    {index === 0
                      ? "Official permit issued by local government"
                      : index === 1
                        ? "Document of incorporation or trade registry"
                        : "Passport or Driver's License of the owner"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-[20px] font-black tracking-[-0.04em]">
              Verification Method
            </h3>
            <p className="mt-2 text-[14px] text-[#526779]">
              Choose how you want to receive your final verification code.
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-[18px] border border-[#2d6dba] bg-[#edf4ff] p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-[#2d6dba] text-white">
                    <i className="bi bi-envelope" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-[18px] font-black">Work Email</div>
                    <div className="text-[12px] text-[#58728a]">
                      Code sent to registered business email
                    </div>
                  </div>
                </div>
                <div className="grid size-5 place-items-center rounded-full bg-[#2d6dba] text-white">
                  <i className="bi bi-check" aria-hidden="true" />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-[18px] border border-[#dfe8f1] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-white text-[#4f6478] ring-1 ring-[#dfe8f1]">
                    <i className="bi bi-phone" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-[18px] font-black">
                      SMS Verification
                    </div>
                    <div className="text-[12px] text-[#58728a]">
                      Code sent to owner's mobile device
                    </div>
                  </div>
                </div>
                <div className="grid size-5 place-items-center rounded-full bg-white ring-1 ring-[#dfe8f1] text-transparent">
                  <span className="sr-only">unchecked</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[16px] border border-[#dfe8f1] bg-white p-4 text-[12px] leading-6 text-[#5d7285]">
              <div className="flex items-start gap-3">
                <i
                  className="bi bi-info-circle text-[18px] text-[#2d6dba]"
                  aria-hidden="true"
                />
                <p>
                  All documents are encrypted using AES-256 and stored on a
                  secure ledger. We only use this information for identity
                  validation.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={submitVerification}
            disabled={submitting}
            className="mt-7 flex w-full items-center justify-between rounded-[18px] bg-gradient-to-r from-[#12304a] via-[#1b4068] to-[#2f68f1] px-5 py-4 text-left text-[28px] font-black text-white shadow-[0_18px_30px_rgba(47,104,241,0.25)] transition hover:-translate-y-0.5"
          >
            <span>
              {submitting ? "Submitting..." : "Submit Verification Request"}
            </span>
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </button>
          {status && (
            <p
              role="status"
              className="mt-4 rounded-[16px] bg-[#eef4ff] px-4 py-3 text-sm font-semibold text-[#24598b]"
            >
              {status}
            </p>
          )}

          <label className="mt-5 flex items-center gap-3 rounded-[16px] bg-white px-3 py-3 text-[14px] text-[#49637a] shadow-sm ring-1 ring-[#e2eaf3]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#2d6dba]"
              defaultChecked
            />
            <span>I agree to the Verification Terms & Conditions</span>
          </label>
        </div>

        <div className="px-5 pb-4 pt-7 text-center text-[20px] font-black tracking-[-0.04em] text-[#12304a]">
          Made with{" "}
          <span className="inline-block align-middle text-[#2d6dba]">♥</span>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage;
