import Link from "next/link";

type Props = {
  agreedTerms: boolean;
  onAgreedTermsChange: (value: boolean) => void;
  marketingConsent: boolean;
  onMarketingConsentChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SignupConsentFields({
  agreedTerms,
  onAgreedTermsChange,
  marketingConsent,
  onMarketingConsentChange,
  disabled,
}: Props) {
  return (
    <div className="ra-consent">
      <label className="ra-consent-row">
        <input
          type="checkbox"
          className="ra-consent-check"
          checked={agreedTerms}
          onChange={(e) => onAgreedTermsChange(e.target.checked)}
          disabled={disabled}
          required
        />
        <span className="ra-consent-text">
          I have read and agree to Rewardology Academy&apos;s{" "}
          <Link href="/terms" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <label className="ra-consent-row">
        <input
          type="checkbox"
          className="ra-consent-check"
          checked={marketingConsent}
          onChange={(e) => onMarketingConsentChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="ra-consent-text">
          I agree that Rewardology Academy may use my data to personalise my learning experience
          and send me platform updates. I can withdraw this consent at any time.
        </span>
      </label>
    </div>
  );
}
