import { createClient } from '@libsql/client';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  if (!isDev) {
    console.log('Skipping seed in non-development environment.');
    return;
  }

  const client = createClient({
    url: process.env.DATABASE_URL || 'file:kinready.db',
  });

  const educationPath = '/home/team/shared/content/education';
  const scriptsPath = '/home/team/shared/content/scripts';

  // Seed educational content
  if (fs.existsSync(educationPath)) {
    const educationFiles = fs.readdirSync(educationPath);
    for (const file of educationFiles) {
      if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(educationPath, file), 'utf-8');
        const slug = file.replace('.md', '');
        const title = slug.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        await client.execute({
          sql: 'INSERT OR REPLACE INTO educational_content (id, title, slug, content, category) VALUES (?, ?, ?, ?, ?)',
          args: [uuidv4(), title, slug, content, 'general'],
        });
      }
    }
  }

  // Seed phone scripts
  if (fs.existsSync(scriptsPath)) {
    const scriptFiles = fs.readdirSync(scriptsPath);
    for (const file of scriptFiles) {
      if (file.endsWith('.md')) {
        const scriptBody = fs.readFileSync(path.join(scriptsPath, file), 'utf-8');
        const scenario = file.replace('.md', '');
        const title = scenario.charAt(0).toUpperCase() + scenario.slice(1) + ' Script';
  
        await client.execute({
          sql: 'INSERT OR REPLACE INTO phone_scripts (id, title, scenario, script_body) VALUES (?, ?, ?, ?)',
          args: [uuidv4(), title, scenario, scriptBody],
        });
      }
    }
  }

  console.log('Content seeding completed.');

  // Seed some workflows
  const workflows = [
    {
      id: uuidv4(),
      title: 'First 72 Hours after a Loss',
      description: 'Immediate steps to take when a loved one passes away.',
      category: 'emergency',
      steps: [
        { title: 'Pronouncement of Death', description: 'Contact a doctor or hospice nurse.', step_type: 'info' },
        { title: 'Notify Family and Friends', description: 'Begin reaching out to close relations.', step_type: 'info' },
        { title: 'Arrange Transportation', description: 'Contact a funeral home or morgue.', step_type: 'info' },
      ]
    },
    {
      id: uuidv4(),
      title: 'Emergency Readiness',
      description: 'Prepare your family for natural disasters or medical emergencies.',
      category: 'emergency',
      steps: [
        { title: 'Build a Kit', description: 'Water, non-perishable food, flashlights.', step_type: 'info' },
        { title: 'Make a Plan', description: 'Evacuation routes and meeting points.', step_type: 'info' },
        { title: 'Document Storage', description: 'Ensure copies of vital documents are in your vault.', step_type: 'document_creation' },
      ]
    }
  ];

  for (const wf of workflows) {
    // Check if workflow exists to avoid duplicates on re-run
    const existing = await client.execute({
      sql: 'SELECT id FROM workflows WHERE title = ?',
      args: [wf.title],
    });

    if (existing.rows.length === 0) {
      await client.execute({
        sql: 'INSERT INTO workflows (id, title, description, category) VALUES (?, ?, ?, ?)',
        args: [wf.id, wf.title, wf.description, wf.category],
      });

      for (let i = 0; i < wf.steps.length; i++) {
        const step = wf.steps[i];
        await client.execute({
          sql: 'INSERT INTO workflow_steps (id, workflow_id, step_order, title, description, step_type) VALUES (?, ?, ?, ?, ?, ?)',
          args: [uuidv4(), wf.id, i + 1, step.title, step.description, step.step_type],
        });
      }
    }
  }

  console.log('Workflow seeding completed.');
  await client.close();
}

seed().catch(console.error);
