# Sejiwa: Anonymous Talk Space

> **Sejiwa** (Indonesian for 'one soul' or 'kindred spirit') evokes a sense of unity and mutual understanding among users who may share similar experiences.
>
> **Anonymous Talk Space** clearly communicates the app's core purpose: a safe and private venue for sharing thoughts and feelings.

## App Description

**Sejiwa: Anonymous Talk Space** is a web-based platform dedicated to providing a secure and supportive environment for individuals to share their experiences, challenges, and feelings related to mental health or psychological issues in a completely anonymous manner. The app is designed to be a place where anyone can find understanding, support, and connection with peers without the fear of judgment or exposure. With a strict moderation system and a strong focus on privacy, Sejiwa aims to be a beacon of hope and community for those in need.

## How Sejiwa Works: The Application Flow

Sejiwa operates on a modern architecture, separating a fast frontend (`Next.js`) from an efficient backend (`Go` with `Gin`), supported by a robust `PostgreSQL` database, and secure session management (`NextAuth.js`).

### 1. Embarking on Your Journey: Registration & Anonymity

- **Quick & Secure Registration:** Users can sign up by creating an anonymous username and password. The app will not request any personal identifiable information such as real names, emails, or phone numbers, ensuring absolute privacy from the start.
- **Secure Login:** After registering, users can log in using their anonymous username and password. This authentication process is handled by the Go backend, which issues a secure token (JWT) that is then managed by `NextAuth.js` on the frontend.

### 2. Exploring & Sharing: The Main Forum

- **Main Dashboard:** Upon logging in, users are directed to a dashboard displaying the latest or most popular discussion threads.
- **Topic Categories:** Threads are organized into various relevant categories (e.g., "Anxiety & Stress," "Depression," "Relationships," "Self-Improvement," "ADHD," etc.). This helps users easily find discussions most relevant to their needs.
- **Creating New Threads:** Users can initiate new discussions by creating a thread. They'll write a title and the content of their thread, then select an appropriate category. Their anonymous username will automatically be associated with the thread.
- **Interacting within Threads:** Users can read threads and replies from other users. They can also write their own replies to share experiences, offer support, or ask questions. Every reply will also display the user's anonymous username.
- **Search Functionality:** Users can search for specific threads or posts using keywords to find information or particular discussions.

### 3. Ensuring Community Safety & Quality: The Strict Moderation System

This is the cornerstone of Sejiwa, crucial for maintaining a safe and supportive environment:

- **Content Reporting:** Every user has the ability to report any post or comment they believe violates community guidelines (e.g., hate speech, harmful content, self-promotion, or spam). They can select the reason for the report from a provided list.
- **Moderation Queue:** Each incoming report instantly appears on a separate moderator dashboard. Moderators are trained individuals with access to this system.
- **Moderator Review & Action:**
  - Moderators review each report and the reported content.
  - They can choose to hide or delete violating content.
  - Moderators can also issue warnings to infringing users or, in cases of repeated or severe violations, ban user accounts (temporarily or permanently) from the platform.
  - All moderation actions are logged for an audit trail.
- **Automated Filtering System (Optional & Advanced):** In the future, Sejiwa can implement an AI/NLP-powered system (such as integration with Perspective API) that automatically flags or even filters highly toxic content before it's displayed, routing it to moderators for further review. This helps reduce the manual workload for moderators and improves response time to negative content.

### 4. Privacy & Data Security

- **True Anonymity:** The system design ensures that no personally identifiable user data is stored or requested.
- **Data Encryption:** User passwords will be encrypted using industry-leading security techniques in the Go backend before being stored in the `PostgreSQL` database.
- **Secure Communication:** All communication between the `Next.js` frontend and the `Go` backend occurs over encrypted connections (HTTPS) to protect data in transit.
- **Clear Privacy Policy:** The app will feature a transparent privacy policy, explaining how anonymous data is handled and protected.

### 5. Additional Support

- **External Resources:** Sejiwa will provide clear and easily accessible links to professional mental health support resources (e.g., crisis hotlines, counseling services) to ensure users can seek further assistance if needed. The app serves as a community support space, not a substitute for professional therapy.
