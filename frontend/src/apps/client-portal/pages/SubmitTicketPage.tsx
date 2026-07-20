import { useState } from 'react';
import { PiuTiSelector } from '../../../components/ticket/PiuTiSelector';
import { SoftwareSelector } from '../../../components/ticket/SoftwareSelector';
import { IssueCategorySelector } from '../../../components/ticket/IssueCategorySelector';
import { AttachmentUploader } from '../../../components/ticket/AttachmentUploader';
import { RichTextEditor } from '../../../components/shared/RichTextEditor';
import { Button } from '../../../components/shared/Button';
import { ticketService } from '../../../services/ticketService';
import type { SoftwareType } from '../../../types/ticket';

export function SubmitTicketPage() {
  const [piuId, setPiuId] = useState<number | null>(null);
  const [tiId, setTiId] = useState<number | null>(null);
  const [software, setSoftware] = useState<SoftwareType | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [otherDescription, setOtherDescription] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

  const handleSoftwareChange = (value: SoftwareType) => {
    setSoftware(value);
    setCategory(null); // clear category when software changes, per spec §6.2
  };

  const validate = (): string | null => {
    if (!piuId) return 'Please select a PIU';
    if (!tiId) return 'Please select a TI';
    if (!software) return 'Please select software';
    if (!category) return 'Please select an issue category';
    if (category === 'OTHER' && otherDescription.trim().length < 10) {
      return 'Please describe the issue (min 10 characters)';
    }
    if (!name.trim()) return 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email';
    if (!description.trim()) return 'Please enter a description';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('piu_id', String(piuId));
      formData.append('ti_id', String(tiId));
      formData.append('software', software!);
      formData.append('issue_category', category!);
      if (otherDescription) formData.append('other_description', otherDescription);
      formData.append('submitter_name', name);
      formData.append('submitter_email', email);
      if (phone) formData.append('submitter_phone', phone);
      formData.append('description', description);
      files.forEach((f) => formData.append('attachments', f));

      const res = await ticketService.submitTicket(formData);
      setTrackingNumber(res.data.tracking_number);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (trackingNumber) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', textAlign: 'center' }}>
        <h2>Ticket Submitted</h2>
        <p>Your tracking number is:</p>
        <div style={{
          fontSize: '1.5rem', fontWeight: 700, padding: '12px 20px',
          backgroundColor: '#f3f4f6', borderRadius: '8px', display: 'inline-block', margin: '12px 0',
        }}>
          {trackingNumber}
        </div>
        <p>
          <button
            onClick={() => navigator.clipboard.writeText(trackingNumber)}
            style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}
          >
            Copy
          </button>
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          A confirmation email has been sent to {email}. Use this tracking number to check your ticket status anytime.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 16px' }}>
      <h1>Submit a Support Ticket</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        <PiuTiSelector piuId={piuId} tiId={tiId} onPiuChange={setPiuId} onTiChange={setTiId} />
        <SoftwareSelector value={software} onChange={handleSoftwareChange} />
        <IssueCategorySelector
          software={software}
          value={category}
          otherDescription={otherDescription}
          onChange={setCategory}
          onOtherDescriptionChange={setOtherDescription}
        />

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
            Your Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
              Phone (optional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
            Description
          </label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>

        <AttachmentUploader files={files} onChange={setFiles} />

        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </Button>
      </div>
    </div>
  );
}