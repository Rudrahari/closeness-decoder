import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PdfUploader from '../components/PdfUploader';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <span style={styles.logo}>🔐</span>
                    <h1 style={styles.title}>Closeness Decoder</h1>
                </div>
                <div style={styles.userInfo}>
                    {user?.avatar && (
                        <img src={user.avatar} alt="avatar" style={styles.avatar} />
                    )}
                    <div style={styles.userDetails}>
                        <span style={styles.userName}>{user?.name}</span>
                        <span style={styles.userEmail}>{user?.email}</span>
                    </div>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main style={styles.main}>
                {/* Welcome Section */}
                <div style={styles.welcomeSection}>
                    <h2 style={styles.welcomeTitle}>
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h2>
                    <p style={styles.welcomeSubtitle}>
                        Upload your PDF files and share them securely with presigned URLs
                    </p>
                </div>

                {/* Two Column Layout */}
                <div style={styles.contentGrid}>
                    {/* Left Column - Upload Section */}
                    <div style={styles.leftColumn}>
                        <div style={styles.uploadSection}>
                            <h3 style={styles.sectionTitle}>📤 Upload PDF</h3>
                            <PdfUploader />
                        </div>
                    </div>

                    {/* Right Column - Info & Stats */}
                    <div style={styles.rightColumn}>
                        {/* Stats Cards */}
                        <div style={styles.statsSection}>
                            <h3 style={styles.sectionTitle}>📊 Quick Info</h3>
                            <div style={styles.statsContainer}>
                                <div style={styles.statCard}>
                                    <span style={styles.statIcon}>📄</span>
                                    <div style={styles.statContent}>
                                        <span style={styles.statValue}>PDF Only</span>
                                        <span style={styles.statLabel}>Supported Format</span>
                                    </div>
                                </div>
                                <div style={styles.statCard}>
                                    <span style={styles.statIcon}>⏱️</span>
                                    <div style={styles.statContent}>
                                        <span style={styles.statValue}>45 mins</span>
                                        <span style={styles.statLabel}>Link Expiry</span>
                                    </div>
                                </div>
                                <div style={styles.statCard}>
                                    <span style={styles.statIcon}>📦</span>
                                    <div style={styles.statContent}>
                                        <span style={styles.statValue}>10 MB</span>
                                        <span style={styles.statLabel}>Max File Size</span>
                                    </div>
                                </div>
                                <div style={styles.statCard}>
                                    <span style={styles.statIcon}>🔒</span>
                                    <div style={styles.statContent}>
                                        <span style={styles.statValue}>Secure</span>
                                        <span style={styles.statLabel}>Presigned URLs</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div style={styles.infoSection}>
                            <h3 style={styles.sectionTitle}>💡 How it works</h3>
                            <div style={styles.infoSteps}>
                                <div style={styles.infoStep}>
                                    <div style={styles.stepNumber}>1</div>
                                    <div style={styles.stepContent}>
                                        <h4 style={styles.stepTitle}>Upload PDF</h4>
                                        <p style={styles.stepDesc}>
                                            Drag and drop or click to select your PDF file
                                        </p>
                                    </div>
                                </div>
                                <div style={styles.infoStep}>
                                    <div style={styles.stepNumber}>2</div>
                                    <div style={styles.stepContent}>
                                        <h4 style={styles.stepTitle}>Get Secure Link</h4>
                                        <p style={styles.stepDesc}>
                                            Receive a presigned URL valid for 45 minutes
                                        </p>
                                    </div>
                                </div>
                                <div style={styles.infoStep}>
                                    <div style={styles.stepNumber}>3</div>
                                    <div style={styles.stepContent}>
                                        <h4 style={styles.stepTitle}>Share with Friends</h4>
                                        <p style={styles.stepDesc}>
                                            Copy the link and share it with anyone
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logo: {
        fontSize: '28px',
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '2px solid #e5e7eb',
    },
    userDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    userName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2937',
    },
    userEmail: {
        fontSize: '12px',
        color: '#6b7280',
    },
    logoutButton: {
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
    },
    main: {
        padding: '32px',
        maxWidth: '1400px',
        margin: '0 auto',
    },
    welcomeSection: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    welcomeTitle: {
        margin: '0 0 8px 0',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937',
    },
    welcomeSubtitle: {
        margin: 0,
        fontSize: '16px',
        color: '#6b7280',
    },
    contentGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '24px',
        alignItems: 'start',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    uploadSection: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
        margin: '0 0 16px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2937',
    },
    statsSection: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    },
    statsContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
    },
    statIcon: {
        fontSize: '24px',
    },
    statContent: {
        display: 'flex',
        flexDirection: 'column',
    },
    statValue: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: '11px',
        color: '#6b7280',
    },
    infoSection: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    },
    infoSteps: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    infoStep: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '13px',
        flexShrink: 0,
    },
    stepContent: {
        display: 'flex',
        flexDirection: 'column',
    },
    stepTitle: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2937',
    },
    stepDesc: {
        margin: 0,
        fontSize: '13px',
        color: '#6b7280',
        lineHeight: 1.4,
    },
};

export default Dashboard;
