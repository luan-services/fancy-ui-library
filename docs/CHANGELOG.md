## Changelog

### Version 1.0.0

- Initial release.


### Version 1.1.0

- CSS Styles update on every component to match patterns.
- Removed onOustideClick listener from <fc-combobox>, not needed anymore.
- Documentation update.
- Fixed bug on <fc-combobox> and <fc-input> caused by fixed id on shadow DOM elements.

### Version 1.1.1

- Added util to calculate wheter <fc-combobox> dropdown should open down or up.
- Fixed a race condition bug on set value property on <fc-combobox>, now it only runs the otpions sate update at slotChangeCallback.

### Version 1.2.0

- Updated package.json to add keywords.
- Fixed bug on <fc-combobox> onSlotChangeLogic.
- Added new component: <fc-label>


### Version 1.3.0

- Added new component: <fc-select>
- Added icon checkmark on <fc-option> on selection and removed selection colors.
- Update icons to allow custom height/width.
- Refactor click listener on <fc-combobox> for better performance.
- Added new `fc-invalid` event on <fc-combobox> and <fc-input> for elements outside it to listen.
- Added `fc-hide` and `fc-show`events on <fc-combobox> for when dropdown is toggled.
- Updated <fc-combobox> to remove unused functions.
- Split toggledropdown function on <fc-combobox> into hideDropdown and showDropdown

### Version 1.3.1

- Added custom validation to <fc-select>, removed strict validation from it.
- Split toggledropdown function on <fc-select> into hideDropdown and showDropdown
- Updated <fc-select> CSS Tokens.

### Version 1.3.2 (Bug Fix)

- Added missing validatorFunction getter and setter on <fc-select>

### Version 1.3.3 (Bug Fix)

- Added missing CSS styles for errors on <fc-select>

### Version 1.3.4

- Updated comments on <fc-select>.
- Removed onFocus listener from <fc-combobox> and switched to onClick for better UX.
- Updated onOptionSelect to prevent element focus loss when clicking on an option.
- Fixed <fc-option> checked-icon slot sizing.
- Updated <fc-select> to allow custom chevron icons.