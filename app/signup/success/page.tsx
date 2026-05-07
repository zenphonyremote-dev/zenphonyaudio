export default function SignupSuccessPage() {
  return (
    <main
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "100vh",
        padding: 24,
        color: "#fff",
        background: "#0a0a14",
        textAlign: "center",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>Welcome to Zenphony Audio</h1>
        <p style={{ opacity: 0.7, marginBottom: 24 }}>
          Your account is ready. Sign in to start using Listen Buddy.
        </p>
        <a
          href="/account"
          style={{
            display: "inline-block",
            padding: "12px 32px",
            background: "linear-gradient(135deg,#7c3aed,#c026d3)",
            color: "#fff",
            borderRadius: 12,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Continue to account
        </a>
      </div>
    </main>
  )
}
