'use client'

import { Combobox, Input, InputBase } from '@mantine/core'

export function BoardSwitchPlaceholder() {
  return (
    <Input.Wrapper label="Board">
      <InputBase
        component="button"
        type="button"
        w="12rem"
        pointer
        rightSection={<Combobox.Chevron />}
        rightSectionPointerEvents="none">
        <Input.Placeholder>Select board</Input.Placeholder>
      </InputBase>
    </Input.Wrapper>
  )
}
