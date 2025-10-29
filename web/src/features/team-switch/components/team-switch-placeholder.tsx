'use client'

import { Combobox, Input, InputBase } from '@mantine/core'

export function TeamSwitchPlaceholder() {
  return (
    <InputBase
      component="button"
      type="button"
      w="12rem"
      pointer
      rightSection={<Combobox.Chevron />}
      rightSectionPointerEvents="none">
      <Input.Placeholder>Select team</Input.Placeholder>
    </InputBase>
  )
}
