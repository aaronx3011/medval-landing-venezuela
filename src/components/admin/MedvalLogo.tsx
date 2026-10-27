import Image from 'next/image'

export const MedvalLogo = () => (
  <span aria-label="Medval Supplies" className="medval-admin-logo" role="img">
    <Image
      alt="Medval Supplies"
      className="medval-admin-logo__light"
      height={68}
      priority
      src="/medval.svg"
      width={190}
    />
    <Image
      alt=""
      aria-hidden="true"
      className="medval-admin-logo__dark"
      height={68}
      priority
      src="/medval-white.svg"
      width={190}
    />
  </span>
)
