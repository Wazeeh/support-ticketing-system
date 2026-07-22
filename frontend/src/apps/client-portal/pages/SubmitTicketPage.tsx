import { useState } from 'react';
import { Link } from 'react-router-dom';

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
  const [copied, setCopied] = useState(false);

  const handleSoftwareChange = (value: SoftwareType) => {
    setSoftware(value);
    setCategory(null);
    setOtherDescription('');
  };

  const validate = (): string | null => {
    if (!piuId) {
      return 'Please select a PIU';
    }

    if (!tiId) {
      return 'Please select a TI';
    }

    if (!software) {
      return 'Please select software';
    }

    if (!category) {
      return 'Please select an issue category';
    }

    if (
      category === 'OTHER' &&
      otherDescription.trim().length < 10
    ) {
      return 'Please describe the issue with at least 10 characters';
    }

    if (!name.trim()) {
      return 'Please enter your name';
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return 'Please enter a valid email';
    }

    if (!description.trim()) {
      return 'Please enter a description';
    }

    return null;
  };

  const handleCopy = async () => {
    if (!trackingNumber) {
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(trackingNumber);
      } else {
        const textArea = document.createElement('textarea');

        textArea.value = trackingNumber;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';

        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();

        const copiedSuccessfully = document.execCommand('copy');

        document.body.removeChild(textArea);

        if (!copiedSuccessfully) {
          throw new Error('Copy failed');
        }
      }

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(
        'Could not copy automatically. Please select and copy the tracking number manually.',
      );
    }
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
      formData.append('software', software as SoftwareType);
      formData.append('issue_category', category as string);

      if (otherDescription.trim()) {
        formData.append(
          'other_description',
          otherDescription.trim(),
        );
      }

      formData.append('submitter_name', name.trim());
      formData.append('submitter_email', email.trim());

      if (phone.trim()) {
        formData.append('submitter_phone', phone.trim());
      }

      formData.append('description', description);

      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response =
        await ticketService.submitTicket(formData);

      setTrackingNumber(
        response.data.tracking_number,
      );
    } catch (err: unknown) {
      const possibleError = err as {
        response?: {
          data?: {
            message?: string | string[];
          };
        };
      };

      const message =
        possibleError.response?.data?.message;

      if (Array.isArray(message)) {
        setError(message.join(', '));
      } else {
        setError(
          message ??
            'Something went wrong. Please try again.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (trackingNumber) {
    return (
      <div
        style={{
          maxWidth: '560px',
          margin: '60px auto',
          padding: '0 20px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            marginBottom: '12px',
          }}
        >
          Ticket Submitted
        </h2>

        <p>Your tracking number is:</p>

        <div
          style={{
            display: 'inline-block',
            maxWidth: '100%',
            margin: '12px 0',
            padding: '14px 22px',
            borderRadius: '8px',
            backgroundColor: '#f3f4f6',
            color: '#111827',
            fontSize: '1.5rem',
            fontWeight: 700,
            overflowWrap: 'anywhere',
          }}
        >
          {trackingNumber}
        </div>

        <div
          style={{
            marginTop: '8px',
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            style={{
              padding: '7px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

       <p
  style={{
    marginTop: '20px',
    color: '#6b7280',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  }}
>
  Your ticket has been submitted successfully. Please save
  your tracking number to check your ticket status anytime.
</p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '28px',
          }}
        >
          <Link
            to="/track"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Track Ticket
          </Link>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/';
            }}
            style={{
              padding: '10px 18px',
              border: '1px solid #6b7280',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Submit Another Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '40px auto',
        padding: '0 16px 50px',
      }}
    >
      <h1>Submit a Support Ticket</h1>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginTop: '24px',
        }}
      >
        <PiuTiSelector
          piuId={piuId}
          tiId={tiId}
          onPiuChange={setPiuId}
          onTiChange={setTiId}
        />

        <SoftwareSelector
          value={software}
          onChange={handleSoftwareChange}
        />

        <IssueCategorySelector
          software={software}
          value={category}
          otherDescription={otherDescription}
          onChange={setCategory}
          onOtherDescriptionChange={setOtherDescription}
        />

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Your Name
          </label>

          <input
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              flex: '1 1 240px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
              }}
            />
          </div>

          <div
            style={{
              flex: '1 1 240px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              Phone (optional)
            </label>

            <input
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
              }}
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Description
          </label>

          <RichTextEditor
            value={description}
            onChange={setDescription}
          />
        </div>

        <AttachmentUploader
          files={files}
          onChange={setFiles}
        />

        {error && (
          <p
            style={{
              color: '#dc2626',
            }}
          >
            {error}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? 'Submitting...'
            : 'Submit Ticket'}
        </Button>
      </div>
    </div>
  );
}