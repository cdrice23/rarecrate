export const handleEdit = (index, setIsEditing) => {
  setIsEditing(isEditingState => isEditingState.map((isEditing, i) => (i === index ? true : isEditing)));
};

export const handleUpdateValues = (index, field, value, setValues, setFieldValue) => {
  setValues(valuesState => {
    const newValues = [...valuesState];
    newValues[index] = { ...newValues[index], [field]: value };
    return newValues;
  });
  setFieldValue(`socialLinks.${index}.${field}`, value);
};
