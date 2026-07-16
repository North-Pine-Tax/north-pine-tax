import React, { useState, useEffect } from 'react';
import { FieldArray } from 'react-final-form-arrays';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { required, composeValidators, nonEmptyArray } from '../../../../util/validators';
import { FieldSelect, InlineTextButton, IconDelete } from '../../../../components';

import css from './CategoryGroupsField.module.css';

// Finds the correct subcategory within the given categories array based on the provided categoryIdToFind.
const findCategoryConfig = (categories, categoryIdToFind) => {
  return categories?.find(category => category.id === categoryIdToFind);
};

// True once every populated level in the given group resolves to a leaf category,
// i.e. the deepest selected option has no further subcategories to pick from.
const isCategoryGroupComplete = (categoryOptions, groupValues, prefix, level = 1) => {
  const value = groupValues?.[`${prefix}${level}`];
  if (!value) {
    return false;
  }
  const categoryConfig = findCategoryConfig(categoryOptions, value);
  const subcategories = categoryConfig?.subcategories || [];
  return subcategories.length === 0
    ? true
    : isCategoryGroupComplete(subcategories, groupValues, prefix, level + 1);
};

// Signature built from only the populated levels of a group, e.g. "categoryLevel1:a|categoryLevel2:b".
// Two groups share a signature only if they picked the exact same chain at every level.
const getCategoryGroupSignature = (groupValues, prefix) =>
  Object.keys(groupValues || {})
    .filter(key => key.startsWith(prefix) && groupValues[key] != null)
    .sort((a, b) => parseInt(a.slice(prefix.length), 10) - parseInt(b.slice(prefix.length), 10))
    .map(key => `${key}:${groupValues[key]}`)
    .join('|');

// FieldArray-level validator: disallow two groups that pick the exact same category chain.
const getDuplicateCategoryGroupsValidator = (prefix, message) => groups => {
  const signatures = (groups || [])
    .map(group => getCategoryGroupSignature(group, prefix))
    .filter(Boolean);
  const hasDuplicates = new Set(signatures).size !== signatures.length;
  return hasDuplicates ? message : undefined;
};

// Flattened, de-duplicated list of every category id selected across all groups and levels.
// This is what gets stored under 'mainCategories', the same key the provider multi-select uses.
const getUniqueCategoryIds = (groups, prefix) => {
  const allIds = (groups || []).reduce((ids, group) => {
    const groupIds = Object.keys(group || {})
      .filter(key => key.startsWith(prefix) && group[key] != null)
      .map(key => group[key]);
    return [...ids, ...groupIds];
  }, []);
  return [...new Set(allIds)];
};

// NOTE: array items need stable keys that don't just track the current index, since
// react-final-form-arrays can't guarantee index-based keys remain correct across
// add/remove - see https://github.com/final-form/react-final-form-arrays/issues/116
const initGroupKeys = initialLength => {
  const counter = initialLength || 0;
  const keys = counter > 0 ? [...Array(counter)].map((_, i) => `categoryGroupKey_${i}`) : [];
  return [counter, keys];
};
const addGroupKey = setGroupKeys => {
  setGroupKeys(([counter, keys]) => [counter + 1, [...keys, `categoryGroupKey_${counter}`]]);
};
const removeGroupKey = (setGroupKeys, index) => {
  setGroupKeys(([counter, keys]) => [counter, [...keys.slice(0, index), ...keys.slice(index + 1)]]);
};

/**
 * Recursively renders subcategory field inputs for a single repeatable category group
 * (e.g. `categoryGroups[0].categoryLevel1`), drilling one level deeper each time the
 * currently selected option has subcategories of its own.
 */
const CategoryGroupField = props => {
  const {
    name,
    currentCategoryOptions,
    level,
    groupValues,
    prefix,
    handleCategoryChange,
    intl,
  } = props;

  const currentCategoryKey = `${prefix}${level}`;
  const fieldName = `${name}.${currentCategoryKey}`;

  const categoryConfig = findCategoryConfig(currentCategoryOptions, groupValues?.[currentCategoryKey]);

  return (
    <>
      {currentCategoryOptions ? (
        <FieldSelect
          key={fieldName}
          id={fieldName}
          name={fieldName}
          className={css.categorySelect}
          onChange={event => handleCategoryChange(event, level, currentCategoryOptions)}
          label={intl.formatMessage(
            { id: 'EditListingDetailsForm.categoryLabel' },
            { categoryLevel: currentCategoryKey }
          )}
          validate={required(
            intl.formatMessage(
              { id: 'EditListingDetailsForm.categoryRequired' },
              { categoryLevel: currentCategoryKey }
            )
          )}
        >
          <option disabled value="">
            {intl.formatMessage(
              { id: 'EditListingDetailsForm.categoryPlaceholder' },
              { categoryLevel: currentCategoryKey }
            )}
          </option>

          {currentCategoryOptions.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </FieldSelect>
      ) : null}

      {categoryConfig?.subcategories?.length > 0 ? (
        <CategoryGroupField
          name={name}
          currentCategoryOptions={categoryConfig.subcategories}
          level={level + 1}
          groupValues={groupValues}
          prefix={prefix}
          handleCategoryChange={handleCategoryChange}
          intl={intl}
        />
      ) : null}
    </>
  );
};

// One repeatable category group: a full category -> subcategory chain, plus a button to
// remove this group (hidden when it's the only one left, since at least one is required).
const CategoryGroup = props => {
  const {
    name,
    groupValues,
    listingCategories,
    prefix,
    formApi,
    intl,
    showDeleteButton,
    onRemove,
  } = props;

  // If a shallower level changes, clear any deeper levels that were previously selected
  // for this group - they belonged to the old subcategory chain, not the new one.
  const handleCategoryChange = (event, level) => {
    const deeperLevelKeys = Object.keys(groupValues || {}).filter(key => {
      const keyLevel = parseInt(key.slice(prefix.length), 10);
      return key.startsWith(prefix) && Number.isInteger(keyLevel) && keyLevel > level;
    });
    deeperLevelKeys.forEach(key => formApi.change(`${name}.${key}`, undefined));
  };

  return (
    <div className={css.categoryGroup}>
      <CategoryGroupField
        name={name}
        currentCategoryOptions={listingCategories}
        level={1}
        groupValues={groupValues}
        prefix={prefix}
        handleCategoryChange={handleCategoryChange}
        intl={intl}
      />

      {showDeleteButton ? (
        <InlineTextButton
          type="button"
          className={css.removeCategoryGroupButton}
          onClick={onRemove}
        >
          <span>
            <IconDelete rootClassName={css.deleteIcon} />
            <FormattedMessage id="EditListingDetailsForm.categoryGroup.remove" />
          </span>
        </InlineTextButton>
      ) : null}
    </div>
  );
};

/**
 * Lets non-provider users assign a listing to several category+subcategory chains ("groups"),
 * each rendered as its own cascading select chain, with a button below to add another group.
 *
 * The raw groups are kept in their own 'categoryGroups' array field. Separately, the unique
 * category ids across all groups/levels are flattened into 'mainCategories' - the same field
 * the provider multi-select writes to - which is what EditListingDetailsPanel persists.
 *
 * @component
 * @param {Object} props
 * @param {Array<Object>} props.listingCategories - The top-level category tree ({id, name, subcategories})
 * @param {string} props.prefix - Key prefix for each level, e.g. 'categoryLevel'
 * @param {Object} props.formApi - Final Form's form API (for imperative field changes)
 * @param {Object} props.values - Current form values
 * @param {Function} props.setAllCategoriesChosen - Lifts "are all groups complete" up to the parent form
 * @returns {JSX.Element}
 */
const CategoryGroupsField = props => {
  const { listingCategories, prefix, formApi, values, setAllCategoriesChosen } = props;
  const intl = useIntl();

  const categoryGroups = values?.categoryGroups;
  const [data, setGroupKeys] = useState(initGroupKeys(categoryGroups?.length));
  const [, groupKeys] = data;

  // Seed the groups once: reuse a previously saved single-path selection (categoryLevel1,
  // categoryLevel2, ...) if this listing predates the multi-group UI; otherwise start with
  // one empty group, since at least one category group is required.
  useEffect(() => {
    if (categoryGroups?.length) {
      return;
    }
    const legacyKeys = Object.keys(values || {}).filter(
      key => key.startsWith(prefix) && values[key] != null
    );
    const legacyGroup = legacyKeys.reduce((group, key) => ({ ...group, [key]: values[key] }), {});
    formApi.change('categoryGroups', [legacyGroup]);
    // Clear the old single-path fields now that their value lives in the new group - they're
    // no longer rendered, but would otherwise linger in form state and get saved again as-is.
    legacyKeys.forEach(key => formApi.change(key, undefined));
    setGroupKeys(initGroupKeys(1));
  }, []);

  useEffect(() => {
    const uniqueIds = getUniqueCategoryIds(categoryGroups, prefix);
    formApi.change('mainCategories', uniqueIds);

    const allComplete =
      categoryGroups?.length > 0 &&
      categoryGroups.every(group => isCategoryGroupComplete(listingCategories, group, prefix));
    setAllCategoriesChosen(allComplete);
  }, [JSON.stringify(categoryGroups)]);

  const duplicateMessage = intl.formatMessage({
    id: 'EditListingDetailsForm.categoryGroup.duplicateError',
  });
  const requiredMessage = intl.formatMessage({
    id: 'EditListingDetailsForm.categoryGroup.atLeastOneRequired',
  });

  return (
    <FieldArray
      name="categoryGroups"
      validate={composeValidators(
        nonEmptyArray(requiredMessage),
        getDuplicateCategoryGroupsValidator(prefix, duplicateMessage)
      )}
    >
      {({ fields }) => {
        const lastGroupValues = fields.value?.[fields.value.length - 1];
        const canAddAnother =
          fields.length === 0 || isCategoryGroupComplete(listingCategories, lastGroupValues, prefix);

        // Compute the duplicate-group message for display directly from the current values.
        // We can't render the FieldArray's meta.error here: when the child selects have their
        // own (required) errors, meta.error is an array of per-item error objects rather than
        // this array-level string, and rendering an object as a React child throws.
        const hasDuplicateGroups =
          !!getDuplicateCategoryGroupsValidator(prefix, true)(fields.value);

        return (
          <div className={css.categoryGroups}>
            {fields.map((name, index) => (
              <CategoryGroup
                key={groupKeys[index]}
                name={name}
                groupValues={fields.value?.[index]}
                listingCategories={listingCategories}
                prefix={prefix}
                formApi={formApi}
                intl={intl}
                showDeleteButton={fields.length > 1}
                onRemove={() => {
                  fields.remove(index);
                  removeGroupKey(setGroupKeys, index);
                }}
              />
            ))}

            {hasDuplicateGroups ? <div className={css.error}>{duplicateMessage}</div> : null}

            {canAddAnother ? (
              <InlineTextButton
                type="button"
                className={css.addCategoryGroupButton}
                onClick={() => {
                  fields.push({});
                  addGroupKey(setGroupKeys);
                }}
              >
                <FormattedMessage id="EditListingDetailsForm.categoryGroup.addCategory" />
              </InlineTextButton>
            ) : null}
          </div>
        );
      }}
    </FieldArray>
  );
};

export default CategoryGroupsField;
