import { contentTypeLabels } from '../../config/productConfig'
import type { ContentType } from '../../types'
import styles from './ContentTypeBadge.module.css'

const tone: Record<ContentType, string> = {
  clinical_guideline: 'tone1',
  research: 'tone2',
  meta_analysis: 'tone2',
  case_report: 'tone3',
  drug_update: 'tone4',
  ministry_news: 'tone5',
  international: 'tone2',
  association: 'tone5',
  conference: 'tone6',
  webinar: 'tone6',
  nmo_course: 'tone6',
  expert_brief: 'tone3',
}

export function ContentTypeBadge({ type }: { type: ContentType }) {
  return <span className={`${styles.badge} ${styles[tone[type]]}`}>{contentTypeLabels[type]}</span>
}
