import { useAdminStats } from '../hooks/useAdminData';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  TrendingUp, 
  FileText,
  Plus,
  Mail,
  ArrowRight
} from 'lucide-react';
import { PageLoader } from '@/shared/components/Loader';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '@/shared/lib/format';

export default function AdminDashboard() {
  const { t, i18n } = useTranslation('admin');
  const { stats, loading } = useAdminStats();
  const navigate = useNavigate();

  if (loading) return <PageLoader />;

  const cards = [
    { 
      label: t('dashboard.stats.newOrders'), 
      value: stats.newOrders, 
      icon: ShoppingBag, 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      link: '/admin/orders?status=new' 
    },
    { 
      label: t('dashboard.stats.ordersMonth'), 
      value: stats.monthOrders, 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      link: '/admin/orders' 
    },
    { 
      label: t('dashboard.stats.subscribers'), 
      value: stats.subscribers, 
      icon: Users, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50', 
      link: '/admin/subscribers' 
    },
    { 
      label: t('dashboard.stats.contentCount'), 
      value: `${stats.articles} · ${stats.products}`, 
      icon: FileText, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
  ];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-500">{t('dashboard.subtitle')}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => card.link && navigate(card.link)}
            className={cn(
              "bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all",
              card.link ? "cursor-pointer hover:shadow-md hover:border-farm-green/20" : ""
            )}
          >
            <div className={cn("p-3 w-fit rounded-2xl mb-6", card.bg)}>
              <card.icon className={cn("w-6 h-6", card.color)} />
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to="/admin/blog/new">
          <Button variant="outline" className="w-full h-32 rounded-[2rem] border-2 border-dashed border-farm-wood/10 hover:border-farm-green hover:bg-farm-green/5 flex flex-col gap-2">
            <Plus className="w-6 h-6 text-farm-green" />
            <span>{t('dashboard.quickActions.writeArticle')}</span>
          </Button>
        </Link>
        <Link to="/admin/products/new">
          <Button variant="outline" className="w-full h-32 rounded-[2rem] border-2 border-dashed border-farm-wood/10 hover:border-farm-green hover:bg-farm-green/5 flex flex-col gap-2">
            <Plus className="w-6 h-6 text-farm-green" />
            <span>{t('dashboard.quickActions.addProduct')}</span>
          </Button>
        </Link>
        <Link to="/admin/newsletter">
          <Button variant="outline" className="w-full h-32 rounded-[2rem] border-2 border-dashed border-farm-wood/10 hover:border-farm-green hover:bg-farm-green/5 flex flex-col gap-2">
            <Mail className="w-6 h-6 text-farm-green" />
            <span>{t('dashboard.quickActions.sendNewsletter')}</span>
          </Button>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">{t('dashboard.recentOrders')}</h2>
          <Link to="/admin/orders" className="text-sm font-bold text-farm-green hover:underline flex items-center gap-1">
            {t('dashboard.allOrders')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-6">
          {stats.recentOrders.map((order: any) => (
            <Link 
              key={order.id} 
              to={`/admin/orders/${order.id}`}
              className="flex items-center justify-between group p-4 hover:bg-farm-cream/50 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-farm-green/10 group-hover:text-farm-green transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{order.userName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 mb-0.5">{formatPrice(order.total, order.currency || 'UAH', i18n.language)}</p>
                <p className="text-[10px] text-farm-berry font-bold uppercase tracking-widest">{order.status}</p>
              </div>
            </Link>
          ))}
          {stats.recentOrders.length === 0 && (
            <div className="py-12 text-center text-gray-400">{t('dashboard.noOrders')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
