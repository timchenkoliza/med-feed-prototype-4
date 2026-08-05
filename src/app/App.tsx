import { Metrika } from './Metrika';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/common/Icon';
import { viewportWidth } from '../config/design-contract';
import { useToast } from '../hooks/useToast';
import { Article } from './components/Article';
import { AskAi } from './components/AskAi';
import { Card } from './components/Card';
import { Overlay } from './components/Overlay';
import { Register } from './components/Register';
import { feeds, sections, specialties, typeFilters, typeLabels, ui } from './config';
import { eventDate } from './format';
import type { FeedId, FeedItem, Section } from './types';
import { useAppState } from './useAppState';
import './app.css';

const sectionTitle: Record<Section, string> = {
  feed: '',
  saved: 'Сохранённое',
  events: 'События и обучение',
  profile: 'Профиль',
};

export default function App({ initialFeed }: { initialFeed?: FeedId } = {}) {
  const app = useAppState(initialFeed);
  const { toast, show, dismiss } = useToast();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<FeedItem | null>(null);
  const [ai, setAi] = useState<FeedItem | null>(null);
  const [reg, setReg] = useState<FeedItem | null>(null);
  const [specOpen, setSpecOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const specTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    navigate(app.feed === 'B' ? '/professional' : '/clinical', { replace: true });
  }, [app.feed, navigate]);

  const openSpecSelector = (e: React.MouseEvent<HTMLButtonElement>) => {
    specTriggerRef.current = e.currentTarget;
    setSpecOpen(true);
  };

  const selectSpecialty = (id: (typeof specialties)[number]['id']) => {
    app.setSpecialty(id);
    setSpecOpen(false);
    show('Лента пересобрана: обновлены материалы, события и фильтры');
    specTriggerRef.current?.focus();
  };

  const spec = specialties.find(s => s.id === app.specialty)!;
  const feedMeta = feeds.find(f => f.id === app.feed)!;
  const filters = typeFilters[app.feed];
  const isWide = app.layoutMode === 'wide';
  const hasLeftRail = 
