import { supabaseClient } from '@supabase/supabase-auth-helpers/nextjs'
import { Form, Formik } from 'formik'
import Router from 'next/router'
import { useState } from 'react'
import { useToasts } from 'react-toast-notifications'
import type { definitions } from '../@types/supabase'
import useActiveOrganization from '../hooks/useActiveOrganization'
import Input from './Input'

type Config = definitions['squeak_config']

interface Props {
    mailgunApiKey: string
    mailgunDomain: string
    mailgunName: string
    mailgunEmail: string
    redirect?: string
    actionButtons: (isValid: boolean, loading: boolean) => JSX.Element
}

interface InitialValues {
    mailgunApiKey: string
    mailgunDomain: string
    mailgunName: string
    mailgunEmail: string
}

const NotificationForm: React.VoidFunctionComponent<Props> = ({
    mailgunApiKey,
    mailgunDomain,
    mailgunName,
    mailgunEmail,
    redirect,
    actionButtons,
}) => {
    const { addToast } = useToasts()
    const { getActiveOrganization } = useActiveOrganization()
    const [loading, setLoading] = useState(false)

    const handleSaveNotifications = async (values: InitialValues) => {
        setLoading(true)
        const organizationId = getActiveOrganization()

        const { error } = await supabaseClient
            .from<Config>('squeak_config')
            .update({
                mailgun_api_key: values.mailgunApiKey,
                mailgun_domain: values.mailgunDomain,
                mailgun_from_email: values.mailgunEmail,
                mailgun_from_name: values.mailgunName,
            })
            .match({ organization_id: organizationId })

        if (!error && redirect) {
            Router.push(redirect)
        }

        addToast(error ? error.message : 'Notification settings saved', {
            appearance: error ? 'error' : 'success',
        })

        setLoading(false)
    }

    const initialValues: InitialValues = {
        mailgunApiKey: mailgunApiKey,
        mailgunDomain: mailgunDomain,
        mailgunName: mailgunName,
        mailgunEmail: mailgunEmail,
    }

    return (
        <Formik validateOnMount initialValues={initialValues} onSubmit={handleSaveNotifications}>
            {({ isValid }) => {
                return (
                    <Form className="mt-6">
                        <Input
                            label="Mailgun API key"
                            id="mailgunApiKey"
                            name="mailgunApiKey"
                            placeholder="Mailgun API key"
                            helperText="Mailgun → User → API Keys → Private API Key"
                        />
                        <Input
                            label="Mailgun domain"
                            id="mailgunDomain"
                            name="mailgunDomain"
                            placeholder="Mailgun domain"
                            helperText="Choose the sending domain from Sending → Domains"
                        />
                        <Input
                            label="Mailgun from name"
                            id="mailgunName"
                            name="mailgunName"
                            placeholder="Mailgun from name"
                        />
                        <Input
                            label="Mailgun from email"
                            id="mailgunEmail"
                            name="mailgunEmail"
                            placeholder="Mailgun from email"
                        />
                        <div className="flex space-x-6 items-center mt-4">{actionButtons(isValid, loading)}</div>
                    </Form>
                )
            }}
        </Formik>
    )
}

export default NotificationForm
