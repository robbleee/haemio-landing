export const metadata = {
  title: 'Investor Pitch',
  robots: { index: false, follow: false },
};

export default function PitchPage() {
  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <iframe
        src="/Haem.io-pitch.pdf"
        style={{
          width: '100%',
          flex: 1,
          border: 'none',
        }}
        title="Haem.io Investor Pitch"
      />
    </div>
  );
}
