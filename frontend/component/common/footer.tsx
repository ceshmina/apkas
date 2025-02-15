import { FaXTwitter, FaInstagram, FaGithub } from 'react-icons/fa6'

export default function Footer() {
  return (<footer className="max-w-[800pt] mx-auto mt-4 p-4">
    <ul className="flex">
      <li>
        <a href="https://x.com/ceshmina" target="_blank"><FaXTwitter /></a>
      </li>
      <li className="ml-2">
        <a href="https://instagram.com/ceshmina" target="_blank"><FaInstagram /></a>
      </li>
      <li className="ml-2">
        <a href="https://github.com/ceshmina" target="_blank"><FaGithub /></a>
      </li>
    </ul>
  </footer>)
}
