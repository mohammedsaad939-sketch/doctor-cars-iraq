import { useState } from "react";
import { T } from "../utils/theme";
import { Card, Btn } from "../utils/components";

const PaymentsScreen = () => {
  const [toasted, setToasted] = useState(false);
  return (
    <div style={{ padding: 16 }}>
      <Card style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 14 }}>💳</div>
        <h3 style={{ margin: "0 0 10px", color: T.textPrimary, fontSize: 18, fontWeight: 800 }}>طرق الدفع</h3>
        <p style={{ margin: "0 0 20px", color: T.textSecondary, fontSize: 13, lineHeight: 1.7 }}>هذه الميزة ستكون متاحة قريباً. نعمل على إضافتها في التحديث القادم.</p>
        {toasted ? (
          <div style={{ color: T.green, fontWeight: 700, fontSize: 14 }}>سنُعلمك عند الإطلاق ✓</div>
        ) : (
          <Btn onClick={() => setToasted(true)}>إشعاري عند الإطلاق</Btn>
        )}
      </Card>
    </div>
  );
};

export default PaymentsScreen;
