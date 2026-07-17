import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import * as validators from '../../../util/validators';

import { FieldTextInput, FieldSelect, Form, PrimaryButton } from '../../../components';

import css from './ContactUsForm.module.css';

const SUBJECT_OPTIONS = [
  'general',
  'support',
  'billing',
  'partnership',
  'other',
];

/**
 * Contact Us form built with React Final Form.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Extra class name for the root element
 * @param {string} [props.rootClassName] - Override class for the root element
 * @param {string} [props.formId] - Form id prefix for field ids
 * @param {boolean} [props.inProgress] - Whether submit is in progress
 * @param {boolean} [props.submitReady] - Whether submit completed successfully
 * @param {Function} props.onSubmit - Submit handler
 * @returns {JSX.Element}
 */
const ContactUsForm = props => {
  const intl = useIntl();

  return (
    <FinalForm
      {...props}
      initialValues={{ subject: '' }}
      render={fieldRenderProps => {
        const {
          rootClassName,
          className,
          formId,
          handleSubmit,
          inProgress = false,
          submitReady = false,
          invalid,
          pristine,
          values,
        } = fieldRenderProps;

        const nameRequired = validators.required(
          intl.formatMessage({ id: 'ContactUsForm.nameRequired' })
        );
        const emailRequired = validators.required(
          intl.formatMessage({ id: 'ContactUsForm.emailRequired' })
        );
        const emailValid = validators.emailFormatValid(
          intl.formatMessage({ id: 'ContactUsForm.emailInvalid' })
        );
        const subjectRequired = validators.required(
          intl.formatMessage({ id: 'ContactUsForm.subjectRequired' })
        );
        const messageRequired = validators.requiredAndNonEmptyString(
          intl.formatMessage({ id: 'ContactUsForm.messageRequired' })
        );

        const classes = classNames(rootClassName || css.root, className);
        const selectClasses = classNames(css.select, {
          [css.selectPlaceholder]: !values?.subject,
        });
        const submitDisabled = invalid || pristine || inProgress;

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            <FieldTextInput
              className={css.field}
              inputRootClass={css.input}
              type="text"
              id={formId ? `${formId}.name` : 'name'}
              name="name"
              autoComplete="name"
              placeholder={intl.formatMessage({ id: 'ContactUsForm.namePlaceholder' })}
              aria-label={intl.formatMessage({ id: 'ContactUsForm.nameLabel' })}
              validate={nameRequired}
            />

            <FieldTextInput
              className={css.field}
              inputRootClass={css.input}
              type="email"
              id={formId ? `${formId}.email` : 'email'}
              name="email"
              autoComplete="email"
              placeholder={intl.formatMessage({ id: 'ContactUsForm.emailPlaceholder' })}
              aria-label={intl.formatMessage({ id: 'ContactUsForm.emailLabel' })}
              validate={validators.composeValidators(emailRequired, emailValid)}
            />

            <FieldSelect
              className={css.field}
              selectClassName={selectClasses}
              id={formId ? `${formId}.subject` : 'subject'}
              name="subject"
              aria-label={intl.formatMessage({ id: 'ContactUsForm.subjectLabel' })}
              validate={subjectRequired}
            >
              <option disabled value="">
                {intl.formatMessage({ id: 'ContactUsForm.subjectPlaceholder' })}
              </option>
              {SUBJECT_OPTIONS.map(option => (
                <option key={option} value={option}>
                  {intl.formatMessage({ id: `ContactUsForm.subject.${option}` })}
                </option>
              ))}
            </FieldSelect>

            <FieldTextInput
              className={css.field}
              inputRootClass={css.textarea}
              type="textarea"
              id={formId ? `${formId}.message` : 'message'}
              name="message"
              placeholder={intl.formatMessage({ id: 'ContactUsForm.messagePlaceholder' })}
              aria-label={intl.formatMessage({ id: 'ContactUsForm.messageLabel' })}
              validate={messageRequired}
            />

            <PrimaryButton
              className={css.submitButton}
              type="submit"
              inProgress={inProgress}
              ready={submitReady}
              disabled={submitDisabled}
            >
              <FormattedMessage id="ContactUsForm.submitButton" />
            </PrimaryButton>
          </Form>
        );
      }}
    />
  );
};

export default ContactUsForm;
