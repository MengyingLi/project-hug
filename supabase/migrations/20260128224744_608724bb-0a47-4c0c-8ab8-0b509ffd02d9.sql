-- Create enums for issue tracker
CREATE TYPE public.issue_priority AS ENUM ('urgent', 'high', 'medium', 'low', 'none');
CREATE TYPE public.issue_status AS ENUM ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled');
CREATE TYPE public.notification_type AS ENUM ('issue_assigned', 'issue_mentioned', 'comment_added', 'status_changed', 'priority_changed');

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create cycles/sprints table
CREATE TABLE public.cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create labels table
CREATE TABLE public.labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6366f1',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create issues table
CREATE TABLE public.issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    priority public.issue_priority NOT NULL DEFAULT 'none',
    status public.issue_status NOT NULL DEFAULT 'backlog',
    assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cycle_id UUID REFERENCES public.cycles(id) ON DELETE SET NULL,
    due_date DATE,
    estimate INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create issue_labels junction table
CREATE TABLE public.issue_labels (
    issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
    label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
    PRIMARY KEY (issue_id, label_id)
);

-- Create comments table
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type public.notification_type NOT NULL,
    issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sequence for issue identifiers
CREATE SEQUENCE public.issue_number_seq START 1;

-- Function to generate issue identifier
CREATE OR REPLACE FUNCTION public.generate_issue_identifier()
RETURNS TRIGGER AS $$
BEGIN
    NEW.identifier := 'ISS-' || nextval('public.issue_number_seq');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for auto-generating issue identifier
CREATE TRIGGER set_issue_identifier
    BEFORE INSERT ON public.issues
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_issue_identifier();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cycles_updated_at BEFORE UPDATE ON public.cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS Policies for cycles
CREATE POLICY "Cycles are viewable by authenticated users" ON public.cycles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create cycles" ON public.cycles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update cycles" ON public.cycles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete cycles" ON public.cycles FOR DELETE TO authenticated USING (true);

-- RLS Policies for labels
CREATE POLICY "Labels are viewable by authenticated users" ON public.labels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create labels" ON public.labels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update labels" ON public.labels FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete labels" ON public.labels FOR DELETE TO authenticated USING (true);

-- RLS Policies for issues
CREATE POLICY "Issues are viewable by authenticated users" ON public.issues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create issues" ON public.issues FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update issues" ON public.issues FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete issues" ON public.issues FOR DELETE TO authenticated USING (true);

-- RLS Policies for issue_labels
CREATE POLICY "Issue labels are viewable by authenticated users" ON public.issue_labels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage issue labels" ON public.issue_labels FOR ALL TO authenticated USING (true);

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by authenticated users" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_issues_status ON public.issues(status);
CREATE INDEX idx_issues_priority ON public.issues(priority);
CREATE INDEX idx_issues_assignee ON public.issues(assignee_id);
CREATE INDEX idx_issues_cycle ON public.issues(cycle_id);
CREATE INDEX idx_issues_sort_order ON public.issues(sort_order);
CREATE INDEX idx_comments_issue ON public.comments(issue_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);

-- Insert default labels
INSERT INTO public.labels (name, color, description) VALUES
    ('bug', '#ef4444', 'Something is broken'),
    ('feature', '#22c55e', 'New feature request'),
    ('improvement', '#3b82f6', 'Enhancement to existing feature'),
    ('documentation', '#a855f7', 'Documentation updates'),
    ('urgent', '#f97316', 'Requires immediate attention');