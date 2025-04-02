import { UserDetailPageContent } from './UserDetailPageContent';

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    return <UserDetailPageContent userId={userId} />;
} 