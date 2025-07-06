import { useEffect } from 'react';

export default function UiAssistant() {
  useEffect(() => {
    console.log('UI Assistant loaded');
  }, []);
  return (
    <aside style={{ position: 'fixed', right: 0, top: 0, padding: 8 }}>
      Need help? This layout is personalized based on your usage.
    </aside>
  );
}
