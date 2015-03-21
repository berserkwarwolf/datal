INSERT INTO `ao_user_roles` (name, code, created_at) VALUES ('Members', 'ao-member', NOW());
INSERT INTO `ao_user_roles` (name, code, created_at) VALUES ('Viewers', 'ao-viewer', NOW());
INSERT INTO `ao_user_roles` (name, code, created_at) VALUES ('Users', 'ao-user', NOW());

INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_view_datastream', 'privatesite.can_view_datastream', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_view_visualization', 'privatesite.can_view_visualization', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_view_dashboard', 'privatesite.can_view_dashboard', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_export_datastream', 'privatesite.can_export_datastream', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_export_dashboard', 'privatesite.can_export_dashboard', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_share_datastream', 'privatesite.can_share_datastream', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_share_visualization', 'privatesite.can_share_visualization', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_share_dashboard', 'privatesite.can_share_dashboard', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('workspace.can_share_datastream', 'workspace.can_share_datastream', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('workspace.can_share_visualization', 'workspace.can_share_visualization', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('workspace.can_share_dashboard', 'workspace.can_share_dashboard', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_view_datastreams', 'privatesite.can_view_datastreams', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_view_visualizations', 'privatesite.can_view_visualizations', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_view_dashboards', 'privatesite.can_view_dashboards', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_export_datastreams', 'privatesite.can_export_datastreams', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_export_dashboards', 'privatesite.can_export_dashboards', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_share_datastreams', 'privatesite.can_share_datastreams', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_share_visualizations', 'privatesite.can_share_visualizations', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_share_dashboards', 'privatesite.can_share_dashboards', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('workspace.can_signin', 'workspace.can_signin', NOW());
INSERT INTO `ao_user_privileges` (name, code, created_at) VALUES ('privatesite.can_signin', 'privatesite.can_signin', NOW());

ALTER TABLE `ao_user_object_grants` ADD `visualization_id` integer;
ALTER TABLE `ao_user_grants` MODIFY `privilege_id` integer;

CREATE TABLE `ao_logs` (
    `id` integer AUTO_INCREMENT NOT NULL PRIMARY KEY,
    `user_id` integer NOT NULL,
    `dashboard_id` integer,
    `datastream_id` integer,
    `visualization_id` integer,
    `content` longtext NOT NULL,
    `created_at` datetime NOT NULL
)
;
ALTER TABLE `ao_logs` ADD CONSTRAINT `visualization_id_refs_id_691a7ce5` FOREIGN KEY (`visualization_id`) REFERENCES `ao_visualizations` (`id`);
ALTER TABLE `ao_logs` ADD CONSTRAINT `dashboard_id_refs_id_3a76ba0d` FOREIGN KEY (`dashboard_id`) REFERENCES `ao_dashboards` (`id`);
ALTER TABLE `ao_logs` ADD CONSTRAINT `datastream_id_refs_id_540a1626` FOREIGN KEY (`datastream_id`) REFERENCES `ao_datastreams` (`id`);
ALTER TABLE `ao_logs` ADD CONSTRAINT `user_id_refs_id_20734e59` FOREIGN KEY (`user_id`) REFERENCES `ao_users` (`id`);
CREATE INDEX `ao_logs_403f60f` ON `ao_logs` (`user_id`);
CREATE INDEX `ao_logs_4d93d9cd` ON `ao_logs` (`dashboard_id`);
CREATE INDEX `ao_logs_6aded78a` ON `ao_logs` (`datastream_id`);
CREATE INDEX `ao_logs_2519b619` ON `ao_logs` (`visualization_id`);

