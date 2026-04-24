import { useNavigate } from 'react-router-dom'
import {
  Building2,
  FileText,
  Hammer,
  Receipt,
  Percent,
  Bell,
  ChevronRight,
  User,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

const settingsGroups = [
  {
    title: 'Företag',
    description: 'Företagsinformation, logotyp och betalningsuppgifter',
    icon: Building2,
    path: '/admin/settings/company',
    color: 'blue',
  },
  {
    title: 'Fakturor',
    description: 'Standardinställningar för fakturor, betalningsvillkor och påminnelser',
    icon: FileText,
    path: '/admin/settings/invoice',
    color: 'green',
  },
  {
    title: 'ROT/RUT',
    description: 'Skattereduktion för husarbete och hushållsnära tjänster',
    icon: Hammer,
    path: '/admin/settings/rotrut',
    color: 'amber',
  },
  {
    title: 'Kvitton',
    description: 'Standardinställningar för kvitton',
    icon: Receipt,
    path: '/admin/settings/receipt',
    color: 'purple',
  },
  {
    title: 'Momssatser',
    description: 'Hantera momssatser för produkter och tjänster',
    icon: Percent,
    path: '/admin/settings/vat',
    color: 'indigo',
  },
  {
    title: 'Påminnelser',
    description: 'Mallar och inställningar för påminnelser',
    icon: Bell,
    path: '/admin/settings/reminders',
    color: 'orange',
  },
]

const accountSettings = [
  {
    title: 'Profil',
    description: 'Hantera din personliga information och lösenord',
    icon: User,
    path: '/admin/settings/profile',
  },
  {
    title: 'Prenumeration',
    description: 'Hantera din prenumeration och fakturering',
    icon: CreditCard,
    path: '/admin/settings/subscription',
  },
]

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
}

export default function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Inställningar</h1>
        <p className="text-muted-foreground">Hantera systeminställningar och företagsinformation</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsGroups.map((group) => {
          const colors = colorClasses[group.color]
          return (
            <Card
              key={group.path}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(group.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center`}>
                    <group.icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <CardTitle className="text-lg mt-3">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Account Settings */}
      <div className="pt-6 border-t">
        <h2 className="text-lg font-semibold mb-4">Kontoinställningar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accountSettings.map((setting) => (
            <Card
              key={setting.path}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(setting.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                    <setting.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{setting.title}</h3>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 text-base">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>Företagsinställningar:</strong> Uppdatera dina företagsuppgifter för att se till att fakturor
            och kvitton visar korrekt information.
          </p>
          <p>
            <strong>Momssatser:</strong> Se till att momssatserna matchar de satser som gäller för din verksamhet.
            Standard är 25%, men 12% och 6% finns också tillgängliga.
          </p>
          <p>
            <strong>ROT/RUT:</strong> Om du utför husarbete kan du aktivera ROT/RUT-avdrag för att hantera
            skattereduktioner åt dina kunder.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
