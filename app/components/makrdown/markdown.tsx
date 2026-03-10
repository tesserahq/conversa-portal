/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { JSX, Suspense, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { cn } from '@shadcn/lib/utils'

interface MarkdownProps {
  children: string
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <div className="space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={COMPONENTS as import('react-markdown').Components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

interface HighlightedPre extends React.HTMLAttributes<HTMLPreElement> {
  children: string
  language: string
}

const HighlightedPre = React.memo(({ children, language, ...props }: HighlightedPre) => {
  const [tokens, setTokens] = useState<any>(null)
  const [bundledLanguages, setBundledLanguages] = useState<any>(null)

  useEffect(() => {
    let isMounted = true

    const loadShiki = async () => {
      const { codeToTokens, bundledLanguages } = await import('shiki')

      if (isMounted) {
        setBundledLanguages(bundledLanguages)
        if (!(language in bundledLanguages)) {
          return
        }

        const { tokens } = await codeToTokens(children, {
          lang: language as keyof typeof bundledLanguages,
          defaultColor: false,
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
        })

        setTokens(tokens)
      }
    }

    loadShiki()

    return () => {
      isMounted = false
    }
  }, [children, language])

  if (!bundledLanguages || !(language in bundledLanguages) || !tokens) {
    return <pre {...props}>{children}</pre>
  }

  return (
    <pre {...props}>
      <code>
        {tokens.map((line: any, lineIndex: any) => (
          <React.Fragment key={lineIndex}>
            <span>
              {line.map((token: any, tokenIndex: any) => {
                const style = typeof token.htmlStyle === 'string' ? undefined : token.htmlStyle

                return (
                  <span
                    key={tokenIndex}
                    className="bg-shiki-light-bg text-shiki-light dark:bg-shiki-dark-bg
                      dark:text-shiki-dark"
                    style={style}>
                    {token.content}
                  </span>
                )
              })}
            </span>
            {lineIndex !== tokens.length - 1 && '\n'}
          </React.Fragment>
        ))}
      </code>
    </pre>
  )
})

HighlightedPre.displayName = 'HighlightedCode'

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
  className?: string
  language: string
}

const CodeBlock = ({ children, className, language, ...restProps }: CodeBlockProps) => {
  const code = typeof children === 'string' ? children : childrenTakeAllStringContents(children)

  const preClass = cn(
    'overflow-x-auto rounded-md border bg-background p-4 font-mono text-sm',
    className
  )

  return (
    <div className="group/code relative mb-4">
      <Suspense
        fallback={
          <pre className={preClass} {...restProps}>
            {children}
          </pre>
        }>
        <HighlightedPre language={language} className={preClass}>
          {code}
        </HighlightedPre>
      </Suspense>
    </div>
  )
}

function childrenTakeAllStringContents(element: any): string {
  if (typeof element === 'string') {
    return element
  }

  if (element?.props?.children) {
    const children = element.props.children

    if (Array.isArray(children)) {
      return children.map((child) => childrenTakeAllStringContents(child)).join('')
    } else {
      return childrenTakeAllStringContents(children)
    }
  }

  return ''
}

const COMPONENTS = {
  h1: withClass('h1', 'text-2xl font-semibold'),
  h2: withClass('h2', 'font-semibold text-xl'),
  h3: withClass('h3', 'font-semibold text-lg'),
  h4: withClass('h4', 'font-semibold text-base'),
  h5: withClass('h5', 'font-medium'),
  strong: withClass('strong', 'font-semibold'),
  a: withClass('a', 'text-blue-400 underline underline-offset-2'),
  blockquote: withClass('blockquote', 'border-l-2 border-primary pl-4'),
  code: ({ children, className, ...rest }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    return match ? (
      <CodeBlock className={className} language={match[1]} {...rest}>
        {children}
      </CodeBlock>
    ) : (
      <code
        className={cn(
          `font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1
            [:not(pre)>&]:py-0.5`
        )}
        {...rest}>
        {children}
      </code>
    )
  },
  pre: ({ children }: any) => children,
  ol: withClass('ol', 'list-decimal space-y-2 pl-6'),
  ul: withClass('ul', 'list-disc space-y-2 pl-6'),
  li: withClass('li', 'my-1.5'),
  table: withClass(
    'table',
    'w-full border-collapse overflow-y-auto rounded-md border border-foreground/20'
  ),
  th: withClass(
    'th',
    'border border-foreground/20 px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right'
  ),
  td: withClass(
    'td',
    'border border-foreground/20 px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right'
  ),
  tr: withClass('tr', 'm-0 border-t p-0 even:bg-muted'),
  p: withClass('p', 'whitespace-pre-wrap'),
  hr: withClass('hr', 'border-foreground/20'),
}

function withClass(Tag: keyof JSX.IntrinsicElements, classes: string) {
  const Component = ({ ...props }: any) => <Tag className={classes} {...props} />
  Component.displayName = Tag
  return Component
}

export default Markdown
