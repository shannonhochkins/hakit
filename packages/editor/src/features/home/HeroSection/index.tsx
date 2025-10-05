import { MousePointerClickIcon, LayoutGridIcon, PuzzleIcon } from 'lucide-react';
import styles from './HeroSection.module.css';
import { getClassNameFactory } from '@helpers/styles/class-name-factory';
import { PrimaryButton } from '@components/Button/Primary';
import { SecondaryButton } from '@components/Button/Secondary';
import { FeatureText } from '@components/FeatureText';

const getClassName = getClassNameFactory('HeroSection', styles);

export const HeroSection = () => {
  return (
    <section className={getClassName('heroSectionContainer')}>
      <div className={getClassName('backgroundAura')} />
      <div className={getClassName('container')}>
        <div className={getClassName('contentWrapper')}>
          <div className={getClassName('leftContent')}>
            <h1 className={getClassName('title')}>
              Build <FeatureText primary='beautiful dashboards' /> for Home Assistant
            </h1>
            <p className={getClassName('description')}>
              Powerful drag-and-drop editor that lets you create fully customized React dashboards for your smart home - no coding required.
            </p>
            <div className={getClassName('buttonGroup')}>
              <PrimaryButton aria-label=''>Get Started Free</PrimaryButton>
              <SecondaryButton aria-label=''>Watch Demo</SecondaryButton>
            </div>
            <div className={getClassName('featureList')}>
              <div className={getClassName('featureItem')}>
                <div className={getClassName('featureIcon')}>
                  <MousePointerClickIcon size={16} />
                </div>
                <span>Drag & Drop</span>
              </div>
              <div className={getClassName('featureItem')}>
                <div className={getClassName('featureIcon')}>
                  <LayoutGridIcon size={16} />
                </div>
                <span>Custom Layouts</span>
              </div>
              <div className={getClassName('featureItem')}>
                <div className={getClassName('featureIcon')}>
                  <PuzzleIcon size={16} />
                </div>
                <span>React Components</span>
              </div>
            </div>
          </div>
          <div className={getClassName('rightContent')}>
            <div className={getClassName('imageContainer')}>
              <div className={getClassName('imageGradientBorder')} />
              <div className={getClassName('imageWrapper')}>
                <img
                  className={getClassName('dashboardImage')}
                  src='https://images.unsplash.com/photo-1629904853716-f0bc54eea481?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
                  alt='HA KIT Dashboard Editor'
                />
              </div>
            </div>
            <div className={getClassName('bottomRightGlow')} />
            <div className={getClassName('topLeftGlow')} />
          </div>
        </div>
      </div>
    </section>
  );
};
