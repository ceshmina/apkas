import BaseMarkdown from 'react-markdown'


export default function Markdown({ children }: { children: string }) {
  return <BaseMarkdown
    components={{
      h2: ({ children }) => (<h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>),
      p: ({ children }) => (<p className="text-sm font-normal my-1">{children}</p>),
      ul: ({ children }) => (<ul className="my-2 pl-5">{children}</ul>),
      li: ({ children }) => (<li className="text-sm font-normal my-1 list-disc">{children}</li>),
    }}
  >{children}</BaseMarkdown>
}
