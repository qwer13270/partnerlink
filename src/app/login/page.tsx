import LoginContent from '@/components/login/LoginContent'

type Props = {
  searchParams: Promise<{ notice?: string; email?: string; next?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { notice, email, next } = await searchParams
  return <LoginContent notice={notice} email={email ?? ''} next={next} />
}
