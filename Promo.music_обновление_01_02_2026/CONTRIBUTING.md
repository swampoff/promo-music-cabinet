# 🤝 Contributing Guide - PROMO.MUSIC

**Версия:** 2.0  
**Дата:** 28 января 2026

---

Спасибо за интерес к участию в разработке PROMO.MUSIC! Этот документ содержит инструкции по внесению вклада в проект.

---

## 📋 Содержание

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

Мы стремимся создать открытое и дружелюбное сообщество. Мы обязуемся:

- Быть уважительными к разным точкам зрения
- Принимать конструктивную критику
- Фокусироваться на том, что лучше для сообщества
- Проявлять эмпатию к другим участникам

### Unacceptable Behavior

- Оскорбительные комментарии
- Троллинг или провокации
- Публичные или личные домогательства
- Публикация личной информации других без разрешения

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0 или pnpm >= 8.0.0
Git
VS Code (recommended)
```

### Setup Development Environment

**1. Fork Repository**

1. Go to https://github.com/your-username/promo-music
2. Click **"Fork"** button
3. Clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/promo-music.git
cd promo-music
```

**2. Add Upstream Remote**

```bash
git remote add upstream https://github.com/original-owner/promo-music.git
```

**3. Install Dependencies**

```bash
npm install
```

**4. Copy Environment File**

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

**5. Run Development Server**

```bash
npm run dev
# Open http://localhost:5173
```

---

## 💻 Development Workflow

### Branch Strategy

```
main (production)
  ↓
develop (staging)
  ↓
feature/your-feature-name
fix/bug-description
docs/documentation-update
```

### Creating a Feature Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/track-test-improvements

# Make changes...
git add .
git commit -m "feat: add improved track test UI"

# Push to your fork
git push origin feature/track-test-improvements
```

### Types of Contributions

- **Features** - New functionality
- **Bug Fixes** - Fix existing bugs
- **Documentation** - Improve or add docs
- **Tests** - Add or improve tests
- **Performance** - Optimize code
- **Refactoring** - Code improvements without changing functionality

---

## 📝 Coding Standards

### TypeScript Guidelines

**1. Always use TypeScript types:**

```typescript
// ❌ Bad
function processTrack(track: any) {
  return track.title;
}

// ✅ Good
interface Track {
  id: string;
  title: string;
  artist: string;
}

function processTrack(track: Track): string {
  return track.title;
}
```

**2. Use interfaces for objects:**

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
```

**3. Avoid `any` type:**

```typescript
// ❌ Bad
const data: any = fetchData();

// ✅ Good
interface ApiResponse {
  success: boolean;
  data: Track[];
}

const response: ApiResponse = await fetchData();
```

### React Component Guidelines

**1. Use functional components:**

```typescript
// ✅ Good
export function TrackCard({ track }: { track: Track }) {
  return (
    <div className="card">
      <h3>{track.title}</h3>
    </div>
  );
}
```

**2. Props interface at the top:**

```typescript
interface TrackCardProps {
  track: Track;
  onPlay: (id: string) => void;
  isPlaying?: boolean;
}

export function TrackCard({ track, onPlay, isPlaying = false }: TrackCardProps) {
  // Component code
}
```

**3. Use hooks correctly:**

```typescript
// ✅ Good
export function TrackList() {
  // All hooks at the top
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchTracks();
  }, []);
  
  // Functions
  const fetchTracks = async () => {
    // ...
  };
  
  // Render
  return (
    <div>
      {tracks.map(track => <TrackCard key={track.id} track={track} />)}
    </div>
  );
}
```

### JSDoc Comments

**Required for:**
- All exported functions
- Complex logic
- API endpoints
- Public interfaces

**Example:**

```typescript
/**
 * Создание заявки на тест трека
 * 
 * @param {SubmitTrackTestRequest} data - Данные заявки
 * @returns {Promise<SubmitTrackTestResponse>} Результат создания
 * @throws {ValidationError} Если данные невалидны
 * @example
 * const result = await submitTrackTest({
 *   user_id: 'user-123',
 *   track_title: 'My Track',
 *   artist_name: 'DJ Cool'
 * });
 */
async function submitTrackTest(
  data: SubmitTrackTestRequest
): Promise<SubmitTrackTestResponse> {
  // Implementation
}
```

### File Naming Conventions

```
Components:     PascalCase      TrackCard.tsx
Utilities:      camelCase       formatTime.ts
Hooks:          use prefix      useTrackPlayer.ts
Types:          PascalCase      Track.ts
Constants:      UPPER_CASE      API_ENDPOINTS.ts
```

### Code Organization

```typescript
// 1. Imports (group by type)
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/app/components/ui/button';
import { TrackCard } from '@/app/components/track-card';

import { formatTime } from '@/utils/formatTime';
import type { Track } from '@/types/track';

// 2. Types/Interfaces
interface TrackListProps {
  tracks: Track[];
}

// 3. Component
export function TrackList({ tracks }: TrackListProps) {
  // 3.1 Hooks
  const [playing, setPlaying] = useState<string | null>(null);
  
  // 3.2 Functions
  const handlePlay = (id: string) => {
    setPlaying(id);
  };
  
  // 3.3 Render
  return (
    <div>
      {tracks.map(track => (
        <TrackCard 
          key={track.id}
          track={track}
          onPlay={handlePlay}
          isPlaying={playing === track.id}
        />
      ))}
    </div>
  );
}
```

### Tailwind CSS Guidelines

**1. Use semantic class groups:**

```tsx
<div className="
  flex items-center justify-between
  p-4 rounded-xl
  bg-white/5 border border-white/10
  hover:bg-white/10 transition-all duration-300
">
  Content
</div>
```

**2. Extract repeated patterns:**

```typescript
// utils/styles.ts
export const glassCard = "backdrop-blur-xl bg-white/5 border border-white/10";
export const button = "px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500";

// Component
<div className={glassCard}>
  <button className={button}>Click</button>
</div>
```

---

## 📋 Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

```
feat:     New feature
fix:      Bug fix
docs:     Documentation
style:    Formatting, missing semi colons, etc.
refactor: Code refactoring
test:     Adding tests
chore:    Maintain tasks
perf:     Performance improvements
```

### Examples

```bash
# Feature
git commit -m "feat(track-test): add audio player to cover"

# Bug fix
git commit -m "fix(analytics): correct revenue calculation"

# Documentation
git commit -m "docs: update API reference for track test"

# Multiple lines
git commit -m "feat(concerts): add filtering by city

- Add city dropdown
- Implement filter logic
- Update UI for mobile

Closes #123"
```

### Commit Best Practices

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Limit first line to 72 characters
- Reference issues and PRs in footer

---

## 🔄 Pull Request Process

### Before Creating PR

```bash
# 1. Update your branch
git checkout main
git pull upstream main

# 2. Rebase your feature branch
git checkout feature/your-feature
git rebase main

# 3. Run tests
npm test

# 4. Run linter
npm run lint

# 5. Build
npm run build
```

### Creating Pull Request

**1. Push to your fork:**

```bash
git push origin feature/your-feature
```

**2. Go to GitHub and create PR**

**3. Fill PR template:**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added
```

### PR Review Process

**Reviewers will check:**

- Code quality and style
- Test coverage
- Documentation
- Breaking changes
- Performance impact

**Response to feedback:**

```bash
# Make requested changes
git add .
git commit -m "fix: address review comments"
git push origin feature/your-feature
```

### Merge Strategy

- **Squash and merge** for feature branches
- **Rebase and merge** for bug fixes
- **Merge commit** for release branches

---

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Specific file
npm test TrackCard.test.tsx
```

### Writing Tests

**Unit Test Example:**

```typescript
// src/utils/__tests__/formatTime.test.ts
import { describe, it, expect } from 'vitest';
import { formatTime } from '../formatTime';

describe('formatTime', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(125)).toBe('2:05');
  });
  
  it('should handle edge cases', () => {
    expect(formatTime(-1)).toBe('0:00');
    expect(formatTime(3661)).toBe('61:01');
  });
});
```

**Component Test Example:**

```typescript
// src/app/components/__tests__/TrackCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TrackCard } from '../TrackCard';

describe('TrackCard', () => {
  const mockTrack = {
    id: '1',
    title: 'Test Track',
    artist: 'Test Artist',
    cover: 'https://example.com/cover.jpg',
    duration: 180
  };
  
  it('should render track information', () => {
    render(<TrackCard track={mockTrack} onPlay={() => {}} />);
    
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });
  
  it('should call onPlay when play button clicked', () => {
    const onPlay = vi.fn();
    render(<TrackCard track={mockTrack} onPlay={onPlay} />);
    
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(onPlay).toHaveBeenCalledWith('1');
  });
});
```

### Test Coverage Goals

- **Utilities:** 80%+
- **Components:** 70%+
- **API Routes:** 60%+
- **Overall:** 70%+

---

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing existing APIs
- Fixing important bugs
- Adding configuration options

### Documentation Files to Update

```
/README.md              - Overview and quick start
/API_REFERENCE.md       - API endpoints
/ARCHITECTURE.md        - Architecture decisions
/DEPLOYMENT.md          - Deployment guide
/CONTRIBUTING.md        - This file
```

### JSDoc Comments

**Function documentation:**

```typescript
/**
 * Calculate the average rating for a track
 * 
 * @param {string} trackId - The UUID of the track
 * @returns {Promise<number>} Average rating from 1-10
 * @throws {NotFoundError} If track doesn't exist
 * @example
 * const rating = await calculateAverageRating('track-123');
 * console.log(rating); // 8.5
 */
async function calculateAverageRating(trackId: string): Promise<number> {
  // Implementation
}
```

---

## 🎯 Issue Labels

### Priority Labels

- `priority: critical` - Must be fixed immediately
- `priority: high` - Should be fixed soon
- `priority: medium` - Normal priority
- `priority: low` - Nice to have

### Type Labels

- `type: bug` - Something isn't working
- `type: feature` - New feature request
- `type: enhancement` - Improvement to existing feature
- `type: documentation` - Documentation improvements
- `type: question` - Questions about the project

### Status Labels

- `status: needs-review` - Awaiting review
- `status: in-progress` - Currently being worked on
- `status: blocked` - Blocked by something
- `status: wont-fix` - Will not be fixed

---

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** - Contributors section
- **Release notes** - Changelog
- **GitHub** - Contributor graph

Thank you for contributing to PROMO.MUSIC! 🎉

---

## 📞 Questions?

- **GitHub Discussions:** https://github.com/your-username/promo-music/discussions
- **Email:** dev@promo.music
- **Discord:** Coming soon

---

**Дата обновления:** 28 января 2026  
**Версия:** 2.0
