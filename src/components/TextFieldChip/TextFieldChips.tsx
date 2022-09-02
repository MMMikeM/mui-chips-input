import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import IconButton from '@mui/material/IconButton'
import type { TextFieldProps } from '@mui/material/TextField'
import { KEYBOARD_KEY } from '@shared/constants/event'
import { matchIsBoolean } from '@shared/helpers/boolean'

import type { MuiChipsInputChip, MuiChipsInputProps } from '../../index.types'
import Styled from './TextFieldChips.styled'

type TextFieldChipsProps = TextFieldProps & {
  chips: MuiChipsInputChip[]
  onAddChip: (chip: MuiChipsInputChip) => void
  clearInputOnBlur?: boolean
  hideClearAll?: boolean
  validate?: MuiChipsInputProps['validate']
  onInputChange?: TextFieldProps['onChange']
  onDeleteChip?: (chipIndex: number) => void
  onDeleteAllChips?: () => void
}

const TextFieldChips = React.forwardRef(
  (
    props: TextFieldChipsProps,
    propRef: TextFieldChipsProps['ref']
  ): React.ReactElement => {
    const {
      chips,
      onAddChip,
      onDeleteChip,
      onDeleteAllChips,
      InputProps,
      onInputChange,
      disabled,
      clearInputOnBlur,
      validate,
      error,
      helperText,
      hideClearAll,
      inputProps,
      ...restTextFieldProps
    } = props
    const [inputValue, setInputValue] = React.useState<string>('')
    const [textError, setTextError] = React.useState<string>('')
    const { onKeyDown, ...restInputProps } = inputProps || {}

    const clearTextError = () => {
      setTextError('')
    }

    const clearInputValue = () => {
      setInputValue('')
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value)
      onInputChange?.(event)
    }

    const handleClickAway = () => {
      clearTextError()
      if (clearInputOnBlur) {
        clearInputValue()
      }
    }

    const addChip = (
      chipValue: MuiChipsInputChip,
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (typeof validate === 'function') {
        const validation = validate(chipValue)
        if (validation === false) {
          event.preventDefault()
          return
        }
        if (!matchIsBoolean(validation) && validation.isError) {
          event.preventDefault()
          setTextError(validation.textError)
          return
        }
      }
      onAddChip(inputValue.trim())
      clearTextError()
      clearInputValue()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const isEnter = event.key === KEYBOARD_KEY.enter
      const isBackspace = event.key === KEYBOARD_KEY.backspace

      if (isEnter) {
        event.preventDefault()
      }

      if (inputValue.length > 0 && isEnter) {
        addChip(inputValue.trim(), event)
      } else if (isBackspace && inputValue.length === 0 && chips.length > 0) {
        onDeleteChip?.(chips.length - 1)
      }

      onKeyDown?.(event)
    }

    const handleClearAll = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (!hideClearAll && !disabled) {
        onDeleteAllChips?.()
        clearInputValue()
        clearTextError()
      }
    }

    const handleDeleteChip = (chipIndex: number) => {
      return () => {
        if (disabled) {
          return
        }
        onDeleteChip?.(chipIndex)
      }
    }

    const hasAtLeastOneChip = chips.length > 0

    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Styled.TextFieldStyled
          value={inputValue}
          onChange={handleChange}
          ref={propRef}
          placeholder="Type and press enter"
          inputProps={{
            onKeyDown: handleKeyDown,
            ...restInputProps
          }}
          disabled={disabled}
          error={Boolean(textError) || error}
          helperText={textError || helperText}
          InputProps={{
            startAdornment: hasAtLeastOneChip
              ? chips.map((chip, index) => {
                  return (
                    <Styled.ChipStyled
                      // We don't use the chip as it can be duplicated by the user
                      // eslint-disable-next-line react/no-array-index-key
                      key={`chip-${index}`}
                      label={chip}
                      title={chip}
                      onKeyDown={(event) => {
                        if (event.key === KEYBOARD_KEY.enter) {
                          handleDeleteChip(index)()
                        }
                      }}
                      tabIndex={disabled ? -1 : 0}
                      aria-disabled={disabled}
                      onDelete={handleDeleteChip(index)}
                    />
                  )
                })
              : null,
            endAdornment: !hideClearAll ? (
              <Styled.EndAdornmentClose
                style={{ visibility: hasAtLeastOneChip ? 'visible' : 'hidden' }}
              >
                <IconButton
                  aria-label="Clear"
                  title="Clear"
                  disabled={disabled}
                  size="small"
                  onClick={handleClearAll}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Styled.EndAdornmentClose>
            ) : null,
            ...InputProps
          }}
          {...restTextFieldProps}
        />
      </ClickAwayListener>
    )
  }
)

TextFieldChips.defaultProps = {
  onInputChange: () => {},
  clearInputOnBlur: false,
  hideClearAll: false,
  onDeleteChip: () => {},
  onDeleteAllChips: () => {},
  validate: () => {
    return true
  }
}

export default TextFieldChips
