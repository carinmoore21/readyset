import { useState } from 'react'
import './App.css'
import { jsPDF } from 'jspdf'
type Step =
  | 'welcome'
  | 'eligibility'
  | 'account-status'
  | 'payment-method'
  | 'payment-terms'
  | 'business-identity'
  | 'returnability'
  | 'application-review'
  | 'watch-email'
  | 'tax-documentation'
  | 'readiness-summary'
  | 'complete'

type PaymentMethod = 'prepay' | 'terms' | null

type ChoiceCardProps = {
  title: string
  description: string
  onClick: () => void
}

function ChoiceCard({ title, description, onClick }: ChoiceCardProps) {
  return (
    <button className="choice-card" type="button" onClick={onClick}>
      <span className="choice-card-copy">
        <span className="choice-card-title">{title}</span>
        <span className="choice-card-description">{description}</span>
      </span>
      <span className="choice-card-arrow" aria-hidden="true">→</span>
    </button>
  )
}

function ClipboardIcon() {
  return (
    <svg className="summary-icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="14" y="12" width="36" height="44" rx="5" />
      <rect x="24" y="7" width="16" height="10" rx="4" />
      <path d="M23 28l4 4 7-8" />
      <path d="M23 40l4 4 7-8" />
      <path d="M38 28h7M38 40h7" />
    </svg>
  )
}

function App() {
  const [step, setStep] = useState<Step>('welcome')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [copyStatus, setCopyStatus] = useState('Download My Readiness Summary (PDF)')

  const progress: Partial<Record<Step, string>> = {
    eligibility: 'Step 1 of 8',
    'account-status': 'Step 2 of 8',
    'payment-method': 'Step 3 of 8',
    'payment-terms': 'Payment Terms preparation',
    'business-identity': 'Step 4 of 8',
    returnability: 'Step 5 of 8',
    'application-review': 'Step 6 of 8',
    'watch-email': 'Step 7 of 8',
    'tax-documentation': 'Step 8 of 8',
    'readiness-summary': 'Readiness Summary',
  }


  function copyReadinessSummary() {
    const applicationUrl =
      'https://app-newaccts-prd.azurewebsites.net/new-accounts-intro'

    setCopyStatus('Preparing PDF...')

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter',
      })

      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 54
      const contentWidth = pageWidth - margin * 2
      let y = 54

      const ensureSpace = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
      }

      const addWrappedText = (
        value: string,
        options: {
          fontSize?: number
          bold?: boolean
          color?: [number, number, number]
          indent?: number
          spaceAfter?: number
          lineHeight?: number
        } = {},
      ) => {
        const {
          fontSize = 10.5,
          bold = false,
          color = [70, 66, 62],
          indent = 0,
          spaceAfter = 9,
          lineHeight = 14,
        } = options

        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setFontSize(fontSize)
        doc.setTextColor(...color)

        const lines = doc.splitTextToSize(value, contentWidth - indent)
        ensureSpace(lines.length * lineHeight + spaceAfter)
        doc.text(lines, margin + indent, y)
        y += lines.length * lineHeight + spaceAfter
      }

      const addSectionHeading = (value: string) => {
        ensureSpace(30)
        y += 5
        addWrappedText(value, {
          fontSize: 15,
          bold: true,
          color: [38, 35, 33],
          spaceAfter: 8,
          lineHeight: 18,
        })
      }

      const addBullet = (value: string) => {
        addWrappedText(`• ${value}`, {
          indent: 12,
          spaceAfter: 3,
          lineHeight: 13,
        })
      }

      doc.setTextColor(255, 132, 78)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(27)
      doc.text('ReadySet', margin, y)
      y += 22

      y += 10

      doc.setDrawColor(255, 132, 78)
      doc.setLineWidth(1)
      doc.line(margin, y, pageWidth - margin, y)
      y += 28

      addWrappedText('Your Readiness Summary', {
        fontSize: 22,
        bold: true,
        color: [38, 35, 33],
        spaceAfter: 7,
        lineHeight: 25,
      })

      addWrappedText(
        'Everything you need before beginning your PRH New Account Application.',
        {
          fontSize: 11,
          spaceAfter: 18,
          lineHeight: 15,
        },
      )

      addSectionHeading('Your Selection')

      addWrappedText(
        paymentMethod === 'terms'
          ? 'Payment Terms (Net 60 EOM)'
          : 'Credit Card (Prepay)',
        {
          fontSize: 13,
          bold: true,
          color: [255, 132, 78],
          spaceAfter: 8,
          lineHeight: 16,
        },
      )

      if (paymentMethod === 'terms') {
        addWrappedText('Before you apply, gather the following:', {
          spaceAfter: 8,
        })

        addWrappedText('Bank information', {
          bold: true,
          color: [38, 35, 33],
          spaceAfter: 5,
        })

        addBullet('Bank name and address')
        addBullet('Bank contact name')
        addBullet('Phone number')
        addBullet('Email address')

        addWrappedText('Three trade references', {
          bold: true,
          color: [38, 35, 33],
          spaceAfter: 5,
        })

        addBullet('Company name and contact name')
        addBullet('Account number')
        addBullet('Phone number')
        addBullet('Email address')
      } else {
        addWrappedText('Pay by credit card for each order.')
      }

      addSectionHeading('Important Reminders')

      addBullet(
        'Use your Legal Business Name consistently. Make sure it matches your tax documentation.',
      )
      addBullet('New account approval typically takes 3–5 business days.')
      addBullet(
        'Keep your supporting information nearby as you complete the application.',
      )

      addSectionHeading("What's Next")

      addWrappedText('1. Complete your PRH account application.', {
  indent: 12,
  spaceAfter: 3,
  lineHeight: 13,
})

addWrappedText('2. Watch for updates from PRH New Accounts.', {
  indent: 12,
  spaceAfter: 3,
  lineHeight: 13,
})

addWrappedText(
  '3. As a final step, submit your tax documentation. Orders can still ship right away. Applicable sales tax will be refunded when documentation is received within 90 days and approved.',
  {
    indent: 12,
    spaceAfter: 3,
    lineHeight: 13,
  },
)

      ensureSpace(72)
      y += 12

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(255, 132, 78)
      doc.textWithLink(
        'Begin Your PRH New Account Application',
        margin,
        y,
        { url: applicationUrl },
      )

      y += 18

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(82, 77, 72)
      doc.text(applicationUrl, margin, y)

      y += 28

      doc.setDrawColor(205, 198, 190)
      doc.line(margin, y, pageWidth - margin, y)
      y += 17

      addWrappedText(
        'ReadySet is for preparation only. It does not replace the official PRH account application.',
        {
          fontSize: 8.5,
          color: [100, 95, 90],
          spaceAfter: 0,
          lineHeight: 11,
        },
      )

      doc.save('ReadySet-Readiness-Summary.pdf')

      window.setTimeout(() => {
        setCopyStatus('Download My Readiness Summary (PDF)')
      }, 1200)
    } catch {
      setCopyStatus('PDF download failed')
      window.setTimeout(() => {
        setCopyStatus('Download My Readiness Summary (PDF)')
      }, 1800)
    }
  }

  function resetGuide() {
    setStep('welcome')
    setPaymentMethod(null)
    setCopyStatus('Download My Readiness Summary (PDF)')
  }

  function ScreenMeta() {
    if (step === 'welcome' || !progress[step]) return null
    return (
      <div className="screen-meta" aria-label="Current guide progress">
        <span />
        <span>{progress[step]}</span>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <img
            className="brand-lockup-image"
            src={`${import.meta.env.BASE_URL}compendium-logo.png`}
            alt="Compendium and Penguin Random House"
          />
        </div>

<div className="product-brand">
  <div className="product-name">ReadySet</div>
  <div className="product-subtitle">
    Before You Begin Your PRH Account Application
  </div>
</div>

<div className="header-spacer" aria-hidden="true" />
</header>

<main className="main-content">
  {step === 'welcome' && (
    <section
      className="guide-card welcome-screen"
      aria-labelledby="welcome-title"
    >
      <div className="screen-content">
        <p className="eyebrow">Know What to Expect</p>
        <h1 id="welcome-title">
          Before You Begin Your PRH Account Application
        </h1>
        <p className="screen-intro">
          This short guide will help you prepare.
        </p>

        <div
          className="time-estimate"
          aria-label="Estimated time: 2 to 3 minutes"
        >
          Estimated time: 2–3 minutes
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => setStep('account-status')}
        >
          Get Started
          <span className="button-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>
    </section>
  )}

  {step === 'account-status' && (
    <section
      className="guide-card"
      aria-labelledby="account-status-title"
    >
      <ScreenMeta />PRH

      <div className="screen-content">
        <p className="eyebrow">PRH Account Status</p>

        <h1 id="account-status-title">
          Have you ordered from PRH or Compendium before?
        </h1>

        <div className="status-copy">
          <p>
            If you have only ordered from Compendium, you will need a PRH
            account before placing future orders.
          </p>
          <p>
            If you have ordered directly from PRH, your account may still be
            active.
          </p>
        </div>

        <div className="information-panel centered-panel accent-panel">
          <p className="information-label">
            Unsure whether your PRH account is active?
          </p>
          <p>
            Contact PRH New Accounts before starting a new application. You do
            not need to know your account number.
          </p>
          <a className="contact-link" href="tel:+18667616685">
            1-866-761-6685
          </a>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => setStep('payment-method')}
        >
          Continue
          <span className="button-arrow" aria-hidden="true">
            →
          </span>
        </button>

        <button
          className="back-button"
          type="button"
          onClick={() => setStep('welcome')}
        >
          ← Back
        </button>
      </div>
    </section>
  )}

        {step === 'payment-method' && (
          <section className="guide-card" aria-labelledby="payment-method-title">
            <ScreenMeta />
            <div className="screen-content">
              <p className="eyebrow">Payment Method</p>
              <h1 id="payment-method-title">How do you plan to pay for orders?</h1>
              <p className="screen-intro">Your payment choice determines what information you will need before starting the application.</p>
              <div className="choice-grid">
                <ChoiceCard title="Credit Card (Prepay)" description="Pay by credit card for each order." onClick={() => { setPaymentMethod('prepay'); setStep('business-identity') }} />
                <ChoiceCard title="Apply for Payment Terms" description="Complete the full credit section with bank information and three trade references." onClick={() => { setPaymentMethod('terms'); setStep('payment-terms') }} />
              </div>
              <div className="quiet-note">
                <strong>Choose carefully.</strong> If you later decide to switch from Prepay to Payment Terms, a new application is required.
              </div>
              <button className="back-button" type="button" onClick={() => { setPaymentMethod(null); setStep('account-status') }}>← Back</button>
            </div>
          </section>
        )}

        {step === 'payment-terms' && (
          <section className="guide-card" aria-labelledby="payment-terms-title">
            <ScreenMeta />
            <div className="screen-content">
              <p className="eyebrow">Payment Terms Preparation</p>
              <h1 id="payment-terms-title">Have this information ready before you begin.</h1>
              <p className="screen-intro">Applying for Payment Terms requires complete bank information and three trade references.</p>
              <div className="information-grid">
                <div className="information-panel">
                  <p className="information-label">Bank information</p>
                  <ul className="check-list"><li>Bank name and address</li><li>Bank contact name</li><li>Phone number</li><li>Email address</li></ul>
                </div>
                <div className="information-panel">
                  <p className="information-label">Three trade references</p>
                  <ul className="check-list"><li>Company name and contact name</li><li>Account number</li><li>Phone number</li><li>Email address</li></ul>
                </div>
              </div>
              <button className="primary-button" type="button" onClick={() => setStep('business-identity')}>
                Continue <span className="button-arrow" aria-hidden="true">→</span>
              </button>
              <button className="back-button" type="button" onClick={() => setStep('payment-method')}>← Back</button>
            </div>
          </section>
        )}

        {step === 'business-identity' && (
          <section className="guide-card" aria-labelledby="business-identity-title">
            <ScreenMeta />
            <div className="screen-content">
              <p className="eyebrow">Business Identity</p>
              <h1 id="business-identity-title">Use your Legal Business Name consistently.</h1>
              <p className="screen-intro">
                Enter it exactly the same way throughout the application and make sure it matches your tax documentation, including LLC, Inc., Corp., or other legal designations.
              </p>
              <div className="example-grid">
                <div className="example-panel example-good">
                  <p className="information-label">Use consistently</p>
                  <p>ABC Gifts, LLC</p><p>ABC Gifts, LLC</p><p>ABC Gifts, LLC</p>
                </div>
                <div className="example-panel example-avoid">
                  <p className="information-label">Avoid variations</p>
                  <p>ABC Gifts</p><p>ABC Gifts LLC</p><p>ABC Gift Shop</p>
                </div>
              </div>
              <button className="primary-button" type="button" onClick={() => setStep('returnability')}>
                Continue <span className="button-arrow" aria-hidden="true">→</span>
              </button>
              <button className="back-button" type="button" onClick={() => setStep(paymentMethod === 'terms' ? 'payment-terms' : 'payment-method')}>← Back</button>
            </div>
          </section>
        )}

        {step === 'returnability' && (
          <section className="guide-card" aria-labelledby="returnability-title">
            <ScreenMeta />
            <div className="screen-content">
              <p className="eyebrow">Returnable or Non-returnable</p>
              <h1 id="returnability-title">Understanding Your Options</h1>
              <p className="screen-intro">
                The application explains both Returnable and Non-returnable purchasing options before asking you to make your selection.
              </p>
              <div className="information-panel centered-panel accent-panel">
                <p className="information-label">Questions? Contact the PRH New Accounts team.</p>
                <a className="contact-link" href="tel:+18667616685">1-866-761-6685</a>
              </div>
              <button className="primary-button" type="button" onClick={() => setStep('application-review')}>
                Continue <span className="button-arrow" aria-hidden="true">→</span>
              </button>
              <button className="back-button" type="button" onClick={() => setStep('business-identity')}>← Back</button>
            </div>
          </section>
        )}

        {step === 'application-review' && (
          <section className="guide-card" aria-labelledby="application-review-title">
            <ScreenMeta />
            <div className="screen-content">
              <p className="eyebrow">Application Review</p>
              <h1 id="application-review-title">Submission does not mean immediate approval.</h1>
              <p className="screen-intro">The PRH New Accounts team reviews the application before the account is established.</p>
              <div className="information-panel">
                <ul className="check-list">
                  <li>Additional information may be requested during the review.</li>
                  <li>New account approval typically takes 3–5 business days after all required information has been received.</li>
                </ul>
              </div>
              <button className="primary-button" type="button" onClick={() => setStep('watch-email')}>
                Continue <span className="button-arrow" aria-hidden="true">→</span>
              </button>
              <button className="back-button" type="button" onClick={() => setStep('returnability')}>← Back</button>
            </div>
          </section>
        )}

        {step === 'watch-email' && (
          <section className="guide-card" aria-labelledby="watch-email-title">
            <ScreenMeta />
            <div className="screen-content">
              <p className="eyebrow">Watch Your Email</p>
              <h1 id="watch-email-title">Keep an eye on your inbox after you apply.</h1>
              <p className="screen-intro">PRH New Accounts communicates by email when additional information is needed and when the account has been approved.</p>
              <div className="information-panel">
                <ul className="check-list">
                  <li>Check the primary contact email regularly, including spam or junk folders.</li>
                  <li>Respond promptly to requests for additional information to help avoid delays.</li>
                </ul>
              </div>
              <button className="primary-button" type="button" onClick={() => setStep('tax-documentation')}>
                Continue <span className="button-arrow" aria-hidden="true">→</span>
              </button>
              <button className="back-button" type="button" onClick={() => setStep('application-review')}>← Back</button>
            </div>
          </section>
        )}

        {step === 'tax-documentation' && (
          <section className="guide-card" aria-labelledby="tax-documentation-title">
            <ScreenMeta />
            <div className="screen-content">
              <p className="eyebrow">Tax Documentation</p>
              <h1 id="tax-documentation-title">Tax documents can be submitted after the application.</h1>
              <p className="screen-intro">Orders do not need to wait for tax documentation before they can ship.</p>
              <div className="information-panel">
                <ul className="check-list">
                  <li>Tax is charged until the required documentation is received and processed.</li>
                  <li>If eligible documentation is submitted within 90 days, qualifying tax charges will be refunded.</li>
                  <li>Some customers may also need a Residential Shipping Address form.</li>
                </ul>
              </div>
              <button className="primary-button" type="button" onClick={() => setStep('readiness-summary')}>
                View My Readiness Summary <span className="button-arrow" aria-hidden="true">→</span>
              </button>
              <button className="back-button" type="button" onClick={() => setStep('watch-email')}>← Back</button>
            </div>
          </section>
        )}

        {step === 'readiness-summary' && (
  <section className="guide-card summary-card" aria-labelledby="readiness-summary-title">
    <ScreenMeta />

    <div className="summary-heading">
      <div className="summary-icon-wrap">
        <ClipboardIcon />
      </div>

      <div>
        <h1 id="readiness-summary-title">Your Readiness Summary</h1>
        <p>Everything you need before beginning your PRH New Account Application.</p>
      </div>
    </div>

    <div className="summary-layout">
      <section className="summary-panel summary-selection-panel">
        <h2>Your Selection</h2>
        <div className="summary-rule" />

        <h3>
          {paymentMethod === 'terms'
            ? 'Payment Terms (Net 60 EOM)'
            : 'Credit Card (Prepay)'}
        </h3>

        {paymentMethod === 'terms' ? (
          <>
            <p>Before you apply, gather the following:</p>

            <h4>Bank information</h4>
            <ul>
              <li>Bank name and address</li>
              <li>Bank contact name</li>
              <li>Phone number</li>
              <li>Email address</li>
            </ul>

            <h4>Three trade references</h4>
            <ul>
              <li>Company name and contact name</li>
              <li>Account number</li>
              <li>Phone number</li>
              <li>Email address</li>
            </ul>
          </>
        ) : (
          <p>Pay by credit card for each order.</p>
        )}
      </section>

      <section className="summary-panel">
        <h2>Important Reminders</h2>
        <div className="summary-rule" />

        <ul className="summary-reminders">
          <li>
            Use your <strong>Legal Business Name</strong> consistently.
            Make sure it matches your tax documentation.
          </li>
          <li>New account approval typically takes 3–5 business days.</li>
          <li>
            Keep your supporting information nearby as you complete the application.
          </li>
        </ul>
      </section>

      <section className="summary-panel whats-next-panel">
        <h2>What&apos;s Next</h2>
        <div className="summary-rule" />

        <ol className="next-steps">
          <li>Complete your PRH account application.</li>

          <li>Watch for updates from PRH New Accounts.</li>

          <li>
            As a final step, submit your tax documentation.
            <span>
              Orders can still ship right away. Applicable sales tax will be
              refunded when documentation is received within 90 days and approved.
            </span>
          </li>
        </ol>
      </section>
    </div>

    <div className="ready-to-apply-box">
      <div className="ready-to-apply-copy">
        <div className="all-set-check" aria-hidden="true">
          ✓
        </div>

        <div>
  <h2>Ready to Apply?</h2>
  <p>
    You&apos;re prepared to begin the Penguin Random House New Account Application.
  </p>

  <button
    className="back-button"
    type="button"
    onClick={() => setStep('tax-documentation')}
  >
    ← Back
  </button>
</div>
      </div>

      <div className="ready-to-apply-actions">
        <a
          className="primary-button application-link"
          href="https://app-newaccts-prd.azurewebsites.net/new-accounts-intro"
          target="_blank"
          rel="noreferrer"
        >
          Begin Your PRH New Account Application
          <span className="button-arrow" aria-hidden="true">
            ↗
          </span>
        </a>

        <button
          className="secondary-button copy-summary-button"
          type="button"
          onClick={copyReadinessSummary}
        >
          {copyStatus}
        </button>
      </div>
    </div>

    <div className="all-set-box">
      <div className="all-set-check" aria-hidden="true">
        ✓
      </div>

      <div>
        <h2>All set!</h2>
        <p>
          You have taken the right steps to prepare. When you are ready,
          complete your PRH account application.
        </p>

        <strong>
          Thank you for partnering with Compendium and Penguin Random House.
        </strong>
      </div>

      <button
        className="primary-button done-button"
        type="button"
        onClick={() => setStep('complete')}
      >
        Done
      </button>
    </div>
  </section>
)}

        {step === 'complete' && (
          <section className="guide-card completion-card" aria-labelledby="complete-title">
            <div className="screen-content">
              <p className="eyebrow">ReadySet Complete</p>
              <h1 id="complete-title">You are ready to begin!</h1>
              <p className="screen-intro">
                Keep your readiness summary nearby as you complete the PRH account application.
              </p>
              <button className="secondary-button" type="button" onClick={resetGuide}>
                Return to the beginning
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <span className="footer-lock" aria-hidden="true" />
        <span>ReadySet is for preparation only. It does not replace the official PRH account application.</span>
      </footer>
    </div>
  )
}

export default App
