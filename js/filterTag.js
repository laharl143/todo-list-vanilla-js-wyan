// FilterTag Component - Single Selection with Task Filtering
document.addEventListener("DOMContentLoaded", function() {
    // Initialize filter tags
    const filterTagsContainer = document.getElementById('filterTagsContainer');
    const tags = ['All', 'Done', 'Not Done'];

    // Create and append filter tags
    tags.forEach((tag, index) => {
        const isActive = index === 0; // First tag (All) active by default
        filterTagsContainer.appendChild(createFilterTag(tag, isActive));
    });

    // Set initial filter state
    filterTasks('all');
});

function createFilterTag(name, active = false) {
    const tag = document.createElement('div');
    tag.className = active ? 'filter-tag active' : 'filter-tag';
    tag.textContent = name;
    tag.dataset.filter = name.toLowerCase().replace(' ', '-');

    tag.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            // Remove active class from all tags in container
            const siblings = this.parentNode.children;
            for (let sibling of siblings) {
                sibling.classList.remove('active');
            }

            // Add active class to clicked tag
            this.classList.add('active');

            // Filter tasks based on selection
            filterTasks(this.dataset.filter);
        }
    });

    return tag;
}

function filterTasks(filterType) {
    const taskCards = document.querySelectorAll('.card');

    taskCards.forEach(card => {
        const isCompleted = card.querySelector('input[type="checkbox"]').checked;

        switch(filterType) {
            case 'all':
                card.style.display = 'flex';
                break;
            case 'done':
                card.style.display = isCompleted ? 'flex' : 'none';
                break;
            case 'not-done':
                card.style.display = !isCompleted ? 'flex' : 'none';
                break;
            default:
                card.style.display = 'flex';
        }
    });

    // Reapply the fade-in animation
    showDivisionsWithDelay();
}