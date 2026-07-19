import { useState } from "react";
import { T } from "../utils/theme";
import { Btn, Input } from "../utils/components";
import { getPasswordStrength } from "../utils/validators";

const STRENGTH_COLOR = { weak: T.red, fair: T.warning, strong: T.green };
const STRENGTH_LABEL = { weak: "ضعيفة", fair: "متوسطة", strong: "قوية" };

// Shown when useAuth reports passwordRecovery === true, i.e. the user followed
// the "reset password" link from their email and Supabase has already issued a
// recovery session for them (see useAuth.js's PASSWORD_RECOVERY handling).
const ResetPasswordScreen = ({ updatePassword, onDone }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async () => {
    setError(null);
    if (!strength.isAcceptable) {
      setError("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف ورقم واحد على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }
    setSubmitting(true);
    try {
      const res = await updatePassword(password);
      if (!res.success) {
        setError(res.error || "حدث خطأ أثناء تحديث كلمة المرور");
        return;
      }
      setSuccess(true);
      setTimeout(() => onDone?.(), 1800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, #0F1F3D 0%, ${T.navy} 60%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "inherit" }}>
      <div style={{ width: "100%", maxWidth: 400, background: T.navyCard, border: `1px solid ${T.navyBorder}`, borderRadius: 24, padding: 28 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <h3 style={{ margin: 0, color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>تعيين كلمة مرور جديدة</h3>
        </div>

        {success ? (
          <div style={{ background: `${T.green}1A`, border: `1px solid ${T.green}44`, borderRadius: 10, padding: "14px", color: T.green, fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>
            ✓ تم تحديث كلمة المرور بنجاح
          </div>
        ) : (
          <>
            <Input label="كلمة المرور الجديدة" value={password} onChange={setPassword} placeholder="••••••••" icon="🔒" type="password" />
            {password && (
              <div style={{ margin: "-8px 0 14px", fontSize: 11, color: STRENGTH_COLOR[strength.level] }}>
                قوة كلمة المرور: {STRENGTH_LABEL[strength.level]}
              </div>
            )}
            <Input label="تأكيد كلمة المرور" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" icon="🔒" type="password" />

            {error && (
              <div style={{ background: `${T.red}1A`, border: `1px solid ${T.red}44`, borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: T.red, fontSize: 13, lineHeight: 1.6 }}>
                {error}
              </div>
            )}

            <Btn onClick={handleSubmit} fullWidth size="lg" disabled={submitting || !password || !confirmPassword}>
              {submitting ? "جارٍ الحفظ..." : "حفظ كلمة المرور"}
            </Btn>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
