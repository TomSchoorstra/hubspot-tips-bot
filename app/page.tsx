export default function Home() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 600, margin: '80px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>HubSpot Tips voor Slack</h1>
      <p style={{ fontSize: 16, color: '#444', lineHeight: 1.6, marginBottom: 32 }}>
        Ontvang elke maandag automatisch een praktische HubSpot-tip in je Slack-workspace.
        Installeer de bot eenmalig en je team blijft op de hoogte van de beste HubSpot-features.
      </p>
      <a
        href="/api/slack/oauth"
        style={{
          display: 'inline-block',
          backgroundColor: '#4A154B',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        Add to Slack
      </a>
    </main>
  )
}
