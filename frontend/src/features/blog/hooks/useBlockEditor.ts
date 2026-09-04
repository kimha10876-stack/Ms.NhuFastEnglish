import { useState, useCallback } from 'react'
import {
  type Block,
  type BlockAlign,
  type BlockType,
  createEmptyBlock,
} from '../utils/blockConverter'

export function useBlockEditor(initialBlocks: Block[] = [createEmptyBlock()]) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks)

  const addBlock = useCallback((type: BlockType, index?: number) => {
    const newBlock = createEmptyBlock(type)
    setBlocks((prev) => {
      if (index !== undefined) {
        const updated = [...prev]
        updated.splice(index + 1, 0, newBlock)
        return updated
      }
      return [...prev, newBlock]
    })
  }, [])

  const updateBlockContent = useCallback((blockId: string, content: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, content } : b)))
  }, [])

  const updateBlockAlign = useCallback((blockId: string, align: BlockAlign) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, align } : b)))
  }, [])

  const changeBlockType = useCallback((blockId: string, type: BlockType) => {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, type } : b)))
  }, [])

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => {
      if (prev.length <= 1) {
        return [createEmptyBlock()]
      }
      return prev.filter((b) => b.id !== blockId)
    })
  }, [])

  const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      const updated = [...prev]
      const temp = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = temp
      return updated
    })
  }, [])

  return {
    blocks,
    setBlocks,
    addBlock,
    updateBlockContent,
    updateBlockAlign,
    changeBlockType,
    deleteBlock,
    moveBlock,
  }
}
