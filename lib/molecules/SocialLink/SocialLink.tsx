import cx from 'classnames';
import { Field } from 'formik';
import { PencilSimple, X, Check } from '@phosphor-icons/react';
import { SocialPlatform } from '@/core/enums/database';
import { SocialLinkProps } from '@/lib/molecules/SocialLink/SocialLink.types';

const SocialLink = ({
  data,
  index,
  onEdit,
  onRemove,
  isEditing,
  onConfirm,
  hasUsername,
  onUpdateValue,
  setValues,
  setIsEditing,
}: SocialLinkProps) => {
  return (
    <>
      {!isEditing ? (
        <div className={cx('socialLinkGroup')}>
          <p className={cx('socialLinkPlatform')}>{data.platform}</p>
          <p className={cx('socialLinkUsername')}>{data.username}</p>
          <button type="button" onClick={() => onEdit(index)}>
            <PencilSimple />
          </button>
          <button
            type="button"
            onClick={() => {
              onRemove(index);
              setIsEditing(isEditingState => isEditingState.filter((_, i) => i !== index));
              setValues(valuesState => valuesState.filter((_, i) => i !== index));
            }}
          >
            <X />
          </button>
        </div>
      ) : (
        <div className={cx('socialLinkAdd')}>
          <select
            name="socialLinkPlatform"
            value={data?.platform ?? ''}
            onChange={event => onUpdateValue(index, 'platform', event.target.value)}
          >
            <option value="">Social Platform:</option>
            {Object.keys(SocialPlatform)
              .filter(key => isNaN(Number(key)) && !hasUsername.filter((_, i) => i !== index).includes(key))
              .map(key => (
                <option key={SocialPlatform[key]} value={key}>
                  {key}
                </option>
              ))}
          </select>
          <Field
            name={'socialLinkUsername'}
            type="text"
            value={data?.username ?? ''}
            placeholder="Username"
            onChange={event => onUpdateValue(index, 'username', event.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              onConfirm(index);
            }}
          >
            <Check />
          </button>
          <button
            type="button"
            onClick={() => {
              onRemove(index);
              setIsEditing(isEditingState => isEditingState.filter((_, i) => i !== index));
              setValues(valuesState => valuesState.filter((_, i) => i !== index));
            }}
          >
            <X />
          </button>
        </div>
      )}
    </>
  );
};

export { SocialLink };
