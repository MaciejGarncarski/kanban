'use client'

import { Combobox, Input, InputBase } from '@mantine/core'

export function TeamSwitchPlaceholder() {
  return (
    <InputBase
      component="button"
      type="button"
      pointer
      rightSection={<Combobox.Chevron />}
      rightSectionPointerEvents="none">
      <Input.Placeholder>Pick value</Input.Placeholder>
    </InputBase>
  )
}
