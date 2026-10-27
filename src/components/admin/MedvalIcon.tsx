import Image from 'next/image'

export const MedvalIcon = () => (
  <span aria-label="Medval Supplies" className="medval-admin-icon" role="img">
    <Image alt="Medval Supplies" height={32} priority src="/medval-icon.svg" width={32} />
  </span>
)
