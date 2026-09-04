export type BlockType = 'heading-lg' | 'heading-sm' | 'paragraph' | 'image' | 'quote' | 'list'
export type BlockAlign = 'left' | 'center' | 'right'

export interface Block {
  id: string
  type: BlockType
  content: string
  align?: BlockAlign
}

export function createEmptyBlock(type: BlockType = 'paragraph'): Block {
  return {
    id: Math.random().toString(36).substring(2, 9),
    type,
    content: '',
  }
}

export function htmlToBlocks(html: string): Block[] {
  if (!html) return [createEmptyBlock()]

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks: Block[] = []

  Array.from(doc.body.children).forEach((el) => {
    const id = Math.random().toString(36).substring(2, 9)
    const alignAttr = el.getAttribute('style') || ''
    let align: BlockAlign = 'left'
    if (alignAttr.includes('text-align: center')) {
      align = 'center'
    } else if (alignAttr.includes('text-align: right')) {
      align = 'right'
    }

    if (el.tagName === 'H2') {
      blocks.push({ id, type: 'heading-lg', content: el.innerHTML, align })
    } else if (el.tagName === 'H3') {
      blocks.push({ id, type: 'heading-sm', content: el.innerHTML, align })
    } else if (el.tagName === 'BLOCKQUOTE') {
      blocks.push({ id, type: 'quote', content: el.innerHTML, align })
    } else if (el.tagName === 'IMG' || el.querySelector('img')) {
      const img = el.tagName === 'IMG' ? el : el.querySelector('img')
      const parentAlign = el.tagName === 'DIV' ? align : 'left'
      blocks.push({ id, type: 'image', content: img?.getAttribute('src') || '', align: parentAlign })
    } else if (el.tagName === 'UL') {
      const items = Array.from(el.querySelectorAll('li')).map((li) => li.innerHTML).join('\n')
      blocks.push({ id, type: 'list', content: items, align })
    } else {
      blocks.push({ id, type: 'paragraph', content: el.innerHTML, align })
    }
  })

  if (blocks.length === 0) {
    blocks.push(createEmptyBlock())
  }
  return blocks
}

export function blocksToHtml(blocks: Block[]): string {
  return blocks
    .map((b) => {
      const styleAttr = b.align && b.align !== 'left' ? ` style="text-align: ${b.align};"` : ''

      if (b.type === 'heading-lg') {
        return `<h2${styleAttr}>${b.content}</h2>`
      }
      if (b.type === 'heading-sm') {
        return `<h3${styleAttr}>${b.content}</h3>`
      }
      if (b.type === 'quote') {
        return `<blockquote${styleAttr}>${b.content}</blockquote>`
      }
      if (b.type === 'image') {
        if (b.align && b.align !== 'left') {
          return `<div style="text-align: ${b.align};"><img src="${b.content}" alt="Blog Image" class="w-full rounded my-6 border shadow-sm" /></div>`
        }
        return `<img src="${b.content}" alt="Blog Image" class="w-full rounded my-6 border shadow-sm" />`
      }
      if (b.type === 'list') {
        const items = b.content.split('\n').filter((line) => line.trim() !== '')
        if (items.length === 0) return ''
        return `<ul${styleAttr}>\n${items.map((item) => `  <li>${item}</li>`).join('\n')}\n</ul>`
      }
      return `<p${styleAttr}>${b.content}</p>`
    })
    .join('\n')
}
