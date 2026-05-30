import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Clock, Tag, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import type { Article } from '../services/api';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';

const Learn: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Family Readiness', 'Medical', 'Financial', 'After Loss'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug) {
          const article = await apiService.getArticleBySlug(slug);
          setCurrentArticle(article);
        } else {
          const data = await apiService.getArticles();
          setArticles(data);
          setCurrentArticle(null);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const filteredArticles = activeCategory === 'All'
    ? articles
    : articles.filter(a => a.category === activeCategory);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-calamity"></div>
        <p className="mt-4 text-warm-slate">Loading educational content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl inline-block">
          <p className="text-lg font-medium">{error}</p>
          <Button 
            variant="ghost" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (slug && currentArticle) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <Link to="/learn" className="inline-flex items-center text-calamity hover:underline mb-4 group">
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Education Hub
        </Link>

        <header className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-warm-slate">
            <span className="px-2 py-1 bg-sage/10 text-sage rounded-md font-medium capitalize">
              {currentArticle.category}
            </span>
            <span>•</span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              5 min read
            </span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-navy dark:text-white leading-tight">
            {currentArticle.title}
          </h1>
        </header>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {currentArticle.content?.split('\n').map((line, index) => {
            if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{line.replace('# ', '')}</h1>;
            if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>;
            if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-bold mt-5 mb-2">{line.replace('### ', '')}</h3>;
            if (line.startsWith('#### ')) return <h4 key={index} className="text-lg font-bold mt-4 mb-2">{line.replace('#### ', '')}</h4>;
            if (line.startsWith('**') && line.endsWith('**')) return <p key={index} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>;
            if (line.trim() === '') return <br key={index} />;
            return <p key={index} className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-4">{line}</p>;
          })}
        </div>

        <div className="border-t border-warm-slate/20 pt-8 mt-12">
          <h3 className="text-xl font-bold mb-4">Related Tasks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="p-4 flex items-center justify-between group cursor-pointer hover:border-sage transition-colors"
              onClick={() => navigate('/onboarding')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-sage">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Complete Readiness Quiz</p>
                  <p className="text-sm text-warm-slate">Assess your current status</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-warm-slate group-hover:text-sage transition-transform group-hover:translate-x-1" />
            </Card>
            <Card 
              className="p-4 flex items-center justify-between group cursor-pointer hover:border-calamity transition-colors"
              onClick={() => navigate('/vault')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-calamity/10 flex items-center justify-center text-calamity">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Add Emergency Contact</p>
                  <p className="text-sm text-warm-slate">Vital first step</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-warm-slate group-hover:text-calamity transition-transform group-hover:translate-x-1" />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-serif font-bold text-navy dark:text-white mb-4">Education Hub</h1>
        <p className="text-xl text-warm-slate">
          Plain-language guidance for life's most complex moments. No legal jargon, just clear steps.
        </p>
      </header>

      {/* Category Filter */}
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-navy text-white shadow-md'
                : 'bg-white dark:bg-navy/50 text-warm-slate hover:bg-soft-sand border border-warm-slate/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-navy/20 rounded-3xl border border-dashed border-warm-slate/30">
          <BookOpen className="w-12 h-12 text-warm-slate/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-warm-slate">No articles found in this category</h3>
          <Button variant="ghost" className="mt-2" onClick={() => setActiveCategory('All')}>
            View all articles
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Link key={article.id} to={`/learn/${article.slug}`}>
              <Card className="h-full group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                <div className="p-6 space-y-4 flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-1 bg-sage/10 text-sage text-xs font-bold rounded uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-navy dark:text-white group-hover:text-calamity transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-warm-slate line-clamp-3">
                    {article.excerpt || "Learn more about this topic and how to prepare your family for the future with our guided roadmap."}
                  </p>
                </div>
                <div className="p-6 pt-0 mt-auto border-t border-warm-slate/5 bg-soft-sand/30 dark:bg-navy/10 flex items-center justify-between group-hover:bg-soft-sand dark:group-hover:bg-navy/20 transition-colors">
                  <span className="text-sm font-medium text-calamity flex items-center">
                    Read Article <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="text-xs text-warm-slate flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> 5 min
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Newsletter / CTA */}
      <section className="bg-sage/10 rounded-3xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy dark:text-white">
          Want a weekly checklist for your family?
        </h2>
        <p className="text-warm-slate max-w-xl mx-auto">
          Get bite-sized preparation tasks delivered to your inbox every Sunday. Small steps lead to big peace of mind.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="flex-grow px-4 py-3 rounded-xl border border-warm-slate/20 focus:outline-none focus:ring-2 focus:ring-sage"
          />
          <Button className="bg-sage hover:bg-sage/90 text-white px-8 py-3 rounded-xl shadow-lg shadow-sage/20">
            Join Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Learn;
