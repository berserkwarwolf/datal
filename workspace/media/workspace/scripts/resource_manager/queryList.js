$(document).ready(function() {
    var datastream_container = '#datastream_datatable';
    var datastream_selector = '#datastream_datatable';

    var visualization_container = '#visualization_datatable';
    var visualization_selector = '#visualization_datatable';

    var dashboard_container = '#dashboard_datatable';
    var dashboard_selector = '#dashboard_datatable';

    var tab_container = '#tabs';
    var tab_selector = "#tabs";

    var confirm_datastream_container = '#id_confirm_datastream_dialog';
    var confirm_datastream_selector = '#id_confirm_datastream_dialog';

    var confirm_dashboard_container = '#id_confirm_dashboard_dialog';
    var confirm_dashboard_selector = '#id_confirm_dashboard_dialog';

    var confirm_visualization_container = '#id_confirm_visualization_dialog';
    var confirm_visualization_selector = '#id_confirm_visualization_dialog';

	var create_dataset_container = '#id_create_datastream_overlay';
    var create_dataset_url_selector = '#create_dataset_url';
    var create_dataset_file_selector = '#create_dataset_file';
    var create_dataset_webservice_selector = '#create_dataset_webservice';
	var select_dataset_selector = '#select_dataset_selector';
    var create_dataset_sidebar_selector = '#create_dataset_sidebar';

    window.resourceTabManager = new ResourceTabManager({container: tab_container, selector: tab_selector, dashboard_container: dashboard_container, datastream_container: datastream_container, visualization_container: visualization_container, dashboard_selector: dashboard_selector, datastream_selector: datastream_selector, visualization_selector: visualization_selector});

    window.datastreamConfirmActionManager = new ConfirmActionManager({container: confirm_datastream_container, selector: confirm_datastream_selector, datatable_container: datastream_container});

    window.datatableDatastreamManager = new DatatableDatastreamManager({container: datastream_container, selector: datastream_selector, tab_container: tab_container , url: '/resource/action_update_datastream_list', delete_url: '/resource/action_delete_datastream', delete_revision_url: '/resource/action_delete_datastream_revision', submit_url: '/resource/action_submit_datastream_revision', publish_url: '/review/action_publish_datastream_revision', unpublish_url: '/review/action_unpublish_datastream_revision', modal_container: confirm_datastream_container  });
    window.datatableDatastreamFilterManagerExtended = new DatatableDatastreamFilterManager({container: datastream_container, selector: '#datastream_filter' });
    window.datatableDatastreamSearchManager = new DatatableSearchManager({container: datastream_container, selector: '#datastream_search' });
    window.datatableDatastreamPaginationManager = new DatatablePaginationManager({container: datastream_container, selector: '#datastream_pagination' });
    window.datatableDatastreamHeaderManager = new DatatableHeaderManager({container: datastream_container, selector: '#datastream_header', clickable_columns: ['1', '2', '3', '4', '5']});

    window.visualizationConfirmActionManager = new ConfirmActionManager({container: confirm_visualization_container, selector: confirm_visualization_selector, datatable_container: visualization_container});

    window.datatableVisualizationManager = new DatatableVisualizationManager({container: visualization_container, selector: visualization_selector, url: '/resource/action_update_visualization_list', delete_url: '/resource/action_delete_visualization', delete_revision_url: '/resource/action_delete_visualization_revision', submit_url: '/resource/action_submit_visualization_revision', publish_url: '/review/action_publish_visualization_revision', unpublish_url: '/review/action_unpublish_visualization_revision', modal_container: confirm_visualization_container});
    window.datatableVisualizationFilterManager = new DatatableFilterManager({container: visualization_container, selector: '#visualization_filter'});
    window.datatableVisualizationSearchManager = new DatatableSearchManager({container: visualization_container, selector: '#visualization_search'});
    window.datatableVisualizationPaginationManager = new DatatablePaginationManager({container: visualization_container, selector: '#visualization_pagination'});
    window.datatableVisualizationHeaderManager = new DatatableHeaderManager({container: visualization_container, selector: '#visualization_header', clickable_columns: ['1', '2', '3', '4', '5']});

    window.dashboardConfirmActionManager = new ConfirmActionManager({container: confirm_dashboard_container, selector: confirm_dashboard_selector, datatable_container: dashboard_container});

    window.datatableDashboardManager = new DatatableDashboardManager({container: dashboard_container, selector: dashboard_selector, url: '/resource/action_update_dashboard_list', delete_url: '/resource/action_delete_dashboard', delete_revision_url: '/resource/action_delete_dashboard_revision', submit_url: '/resource/action_submit_dashboard_revision', publish_url: '/review/action_publish_dashboard_revision', unpublish_url: '/review/action_unpublish_dashboard_revision', modal_container: confirm_dashboard_container});
    window.datatableDashboardFilterManagerExtended = new DatatableDashboardFilterManager({container: dashboard_container, selector: '#dashboard_filter' });
    window.datatableDashboardSearchManager = new DatatableSearchManager({container: dashboard_container, selector: '#dashboard_search' });
    window.datatableDashboardPaginationManager = new DatatablePaginationManager({container: dashboard_container, selector: '#dashboard_pagination' });
    window.datatableDashboardHeaderManager = new DatatableDashboardHeaderManager({container: dashboard_container, selector: '#dashboard_header', clickable_columns: ['1', '2', '3', '4']});

	window.createDashboard = new CreateDashboard({'$Container' : $('#id_dashboard_container'), 'container': dashboard_container});
	
	my_container = '#id_create_datastream_overlay';
	var my_datatable_container = '#id_datasetLibrary';
    var my_datatable_selector = '#id_datasetLibrary';
	var confirm_container = '#id_confirm_dialog';
	
	window.datatableDatasetManager = new OverlayDatatableDatasetManager({container: my_datatable_container, selector: my_datatable_selector, url: '/dataset/action_update_list', delete_url: '/dataset/action_delete_dataset', delete_revision_url: '/dataset/action_delete_dataset_revision', submit_url: '/dataset/action_submit', publish_url: '/review/action_publish_dataset_revision', unpublish_url: '/review/action_unpublish_dataset_revision', modal_container: confirm_container });
	window.datatableHeaderManager = new OverlayDatatableDatasetHeaderManager({container: my_datatable_container, selector: '#datasetTableOverlay_header', clickable_columns: ['1', '2', '3', '4', '5', '6']});
	window.datatableSearchManager = new DatatableSearchManager({container: my_datatable_container, selector: '#dataset_search' });
    window.datatablePaginationManager = new DatatablePaginationManager({container: my_datatable_container, selector: '#dataset_pagination' });
	
	window.createDatastreamURLManager = new CreateDatastreamURLManager({container: my_container, selector: create_dataset_url_selector, save_draft_url: '/dataset/save_url_as_draft', save_review_url: '/dataset/save_url_as_review', save_approved_url: '/dataset/save_url_as_approved', save_published_url: '/dataset/save_url_as_published'});
    window.createDatastreamFileManager = new CreateDatastreamFileManager({container: my_container, selector: create_dataset_file_selector, save_draft_url: '/dataset/save_file_as_draft', save_review_url: '/dataset/save_file_as_review', save_approved_url: '/dataset/save_file_as_approved', save_published_url: '/dataset/save_file_as_published'});
	window.datasetCreateWebserviceManager = new DatasetCreateWebserviceManager({container: my_container, selector: create_dataset_webservice_selector, save_draft_url: '/dataset/save_webservice_as_draft', save_review_url: '/dataset/save_webservice_as_review', save_approved_url: '/dataset/save_webservice_as_approved', save_published_url: '/dataset/save_webservice_as_published'});
    window.createDatastreamSelectDataset = new CreateDatastreamSelectDataset({container: my_container, selector: '#id_datasetLibrary', save_draft_url: '/dataset/save_file_as_draft', save_review_url: '/dataset/save_file_as_review', save_approved_url: '/dataset/save_file_as_approved', save_published_url: '/dataset/save_file_as_published'});
    window.createDatastreamSidebarManager = new CreateDatastreamSidebarManager({container: my_container, selector: create_dataset_sidebar_selector});
});